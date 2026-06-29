"""
HemaVision AI - Comprehensive End-to-End Flow Test
Tests all API endpoints in sequence: register → login → profile → assessment → screening → results → report
"""
import urllib.request
import urllib.error
import json
import os
import sys
from datetime import datetime

BASE = "http://localhost:8000/api/v1"
REPORT_BASE = "http://localhost:8000/api/report"
TOKEN = None
TEST_EMAIL = f"test_e2e_{int(datetime.now().timestamp())}@hemavision.ai"
TEST_PASSWORD = "TestPass123!"

def api_call(method, path, data=None, headers=None, base=None):
    """Make an API call and return (status_code, response_json)"""
    url = (base or BASE) + path
    hdrs = headers or {}
    if TOKEN:
        hdrs["Authorization"] = f"Bearer {TOKEN}"
    
    if data is not None and not isinstance(data, bytes):
        data = json.dumps(data).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        resp = urllib.request.urlopen(req)
        body = json.loads(resp.read().decode())
        return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            body = json.loads(body)
        except:
            pass
        return e.code, body

def api_form_login(email, password):
    """Login via OAuth2 form post"""
    import urllib.parse
    data = urllib.parse.urlencode({"username": email, "password": password}).encode()
    hdrs = {"Content-Type": "application/x-www-form-urlencoded"}
    req = urllib.request.Request(f"{BASE}/auth/login", data=data, headers=hdrs, method="POST")
    try:
        resp = urllib.request.urlopen(req)
        body = json.loads(resp.read().decode())
        return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            body = json.loads(body)
        except:
            pass
        return e.code, body

def multipart_upload(path, files_dict):
    """Upload files via multipart/form-data"""
    import uuid
    boundary = uuid.uuid4().hex
    body = b""
    for field_name, filepath in files_dict.items():
        filename = os.path.basename(filepath)
        with open(filepath, "rb") as f:
            file_data = f.read()
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode()
        body += b"Content-Type: image/png\r\n\r\n"
        body += file_data
        body += b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    
    hdrs = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {TOKEN}"
    }
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers=hdrs, method="POST")
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read().decode())
        return resp.status, result
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            err_body = json.loads(err_body)
        except:
            pass
        return e.code, err_body

passed = 0
failed = 0
issues = []

def test(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅ {name}")
    else:
        failed += 1
        issues.append(f"{name}: {detail}")
        print(f"  ❌ {name} — {detail}")

print("=" * 70)
print("  HEMAVISION AI — END-TO-END FLOW TEST")
print("=" * 70)

# ── 1. REGISTRATION ──────────────────────────────────────
print("\n🔹 Step 1: User Registration")
status, body = api_call("POST", "/auth/register", {"email": TEST_EMAIL, "password": TEST_PASSWORD})
test("Register new user", status == 201, f"status={status}, body={body}")
test("Response has user ID", isinstance(body, dict) and "id" in body, f"body={body}")

# ── 2. LOGIN ─────────────────────────────────────────────
print("\n🔹 Step 2: User Login")
status, body = api_form_login(TEST_EMAIL, TEST_PASSWORD)
test("Login successful", status == 200, f"status={status}, body={body}")
test("Token returned", isinstance(body, dict) and "access_token" in body, f"body={body}")
if isinstance(body, dict) and "access_token" in body:
    TOKEN = body["access_token"]

# ── 3. HEALTH PROFILE SETUP ─────────────────────────────
print("\n🔹 Step 3: Health Profile Setup")
profile_data = {
    "age": 25,
    "gender": "female",
    "height": 162.0,
    "weight": 55.0,
    "dietary_habit": "veg",
    "medical_conditions": "",
    "lifestyle": "moderate"
}
status, body = api_call("POST", "/profile", profile_data)
test("Create profile", status == 201, f"status={status}, body={body}")
test("Profile has required fields", isinstance(body, dict) and all(k in body for k in ["age", "gender", "dietary_habit"]), f"body={body}")

# Verify profile retrieval
status, body = api_call("GET", "/profile")
test("Retrieve profile", status == 200, f"status={status}, body={body}")

# ── 4. SYMPTOM ASSESSMENT ────────────────────────────────
print("\n🔹 Step 4: Symptom Assessment")
symptoms = {
    "fatigue": "yes",
    "dizziness": "sometimes",
    "headache": "no",
    "shortness_of_breath": "sometimes",
    "pale_skin": "yes",
    "cold_hands_feet": "sometimes",
    "weakness": "yes",
    "chest_pain": "no",
    "brittle_nails": "yes",
    "tongue_soreness": "no",
    "irregular_heartbeat": "no",
    "poor_appetite": "sometimes",
    "craving_non_food": "no",
    "difficulty_concentrating": "yes"
}
status, body = api_call("POST", "/assessment", {"symptoms": symptoms})
test("Submit assessment", status == 201, f"status={status}, body={body}")
test("Risk score present", isinstance(body, dict) and "risk_score" in body, f"body={body}")
if isinstance(body, dict):
    score = body.get("risk_score", 0)
    level = body.get("risk_level", "")
    test("Risk score in valid range (0-100)", 0 <= score <= 100, f"score={score}")
    test("Risk level is valid", level in ["Normal", "Mild", "Moderate", "Severe"], f"level={level}")
    print(f"    → Symptom Risk Score: {score}%, Level: {level}")

    # ── CLINICAL ACCURACY CHECK: Symptom scoring ──
    # With 5 "yes" (fatigue, pale_skin, weakness, brittle_nails, difficulty_concentrating)
    # and 4 "sometimes" (dizziness, shortness_of_breath, cold_hands_feet, poor_appetite)
    # Score = (5*2 + 4*1) / (14*2) * 100 = 14/28 * 100 = 50%
    # Expected: Moderate tier (50-75)
    expected_heuristic = round((5*2 + 4*1) / (14*2) * 100, 2)
    print(f"    → Expected heuristic tier: Moderate (50-75%)")
    test("Symptom score matches clinical risk tier", 50 <= score <= 75, 
         f"expected 50-75 (Moderate), got {score}")

# ── 5. MULTIMODAL SCREENING ──────────────────────────────
print("\n🔹 Step 5: Multimodal Screening (Eye + Nail + Tongue)")
test_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_samples")
eye_path = os.path.join(test_dir, "sample_eye.png")
nail_path = os.path.join(test_dir, "sample_nail.png")
tongue_path = os.path.join(test_dir, "sample_tongue.png")

test("Test sample images exist", os.path.exists(eye_path) and os.path.exists(nail_path) and os.path.exists(tongue_path),
     f"eye={os.path.exists(eye_path)}, nail={os.path.exists(nail_path)}, tongue={os.path.exists(tongue_path)}")

status, body = multipart_upload("/screening", {
    "eye_image": eye_path,
    "nail_image": nail_path,
    "tongue_image": tongue_path
})
test("Screening submission", status == 201, f"status={status}, body={body}")

if isinstance(body, dict) and status == 201:
    test("Fusion score present", "fusion_score" in body, f"keys={list(body.keys())}")
    test("Risk level present", "final_risk_level" in body, f"keys={list(body.keys())}")
    test("Eye score present", "eye_score" in body and body["eye_score"] is not None, f"eye_score={body.get('eye_score')}")
    test("Nail score present", "nail_score" in body and body["nail_score"] is not None, f"nail_score={body.get('nail_score')}")
    test("Tongue score present", "tongue_score" in body and body["tongue_score"] is not None, f"tongue_score={body.get('tongue_score')}")
    test("Symptom score integrated", "symptom_score" in body and body["symptom_score"] is not None, f"symptom_score={body.get('symptom_score')}")
    
    fusion = body.get("fusion_score", 0)
    risk = body.get("final_risk_level", "")
    test("Fusion score in valid range", 0 <= fusion <= 100, f"fusion={fusion}")
    test("Risk level valid", risk in ["Normal", "Mild", "Moderate", "Severe"], f"risk={risk}")
    
    # Check fusion score consistency with risk level
    if fusion < 25: expected_risk = "Normal"
    elif fusion < 50: expected_risk = "Mild"
    elif fusion < 75: expected_risk = "Moderate"
    else: expected_risk = "Severe"
    test("Risk level consistent with score", risk == expected_risk, f"fusion={fusion}, expected_risk={expected_risk}, got={risk}")
    
    # Check explanation/gradcam data
    explanation = body.get("explanation", {})
    test("Explanation contains gradcam_eye", explanation and "gradcam_eye" in explanation, f"explanation keys={list(explanation.keys()) if explanation else 'None'}")
    test("Explanation contains weights_used", explanation and "weights_used" in explanation, f"explanation={explanation}")
    test("Explanation contains SHAP data", explanation and "shap" in explanation, f"explanation keys={list(explanation.keys()) if explanation else 'None'}")
    
    # Check diet recommendations
    diet = body.get("diet_recommendations", {})
    test("Diet recommendations present", diet and isinstance(diet, dict), f"diet={diet}")
    test("Diet has iron sources", diet and "iron_sources" in diet, f"diet keys={list(diet.keys()) if diet else 'None'}")
    test("Diet has vitamin C sources", diet and "vitamin_c_sources" in diet, f"diet keys={list(diet.keys()) if diet else 'None'}")
    
    print(f"\n    → Modality Scores:")
    print(f"      Eye:     {body.get('eye_score')}%")
    print(f"      Nail:    {body.get('nail_score')}%")
    print(f"      Tongue:  {body.get('tongue_score')}%")
    print(f"      Symptom: {body.get('symptom_score')}%")
    print(f"    → Fusion Score: {fusion}%")
    print(f"    → Risk Level:   {risk}")
    if explanation and "weights_used" in explanation:
        print(f"    → Weights Used: {explanation['weights_used']}")

# ── 6. RETRIEVE SCREENINGS ───────────────────────────────
print("\n🔹 Step 6: Retrieve Screening Records")
status, body = api_call("GET", "/screening")
test("Get all screenings", status == 200, f"status={status}")
test("At least one screening", isinstance(body, list) and len(body) >= 1, f"count={len(body) if isinstance(body, list) else 'N/A'}")

status, body = api_call("GET", "/screening/latest")
test("Get latest screening", status == 200, f"status={status}")

# ── 7. PROGRESS TRACKING ─────────────────────────────────
print("\n🔹 Step 7: Progress Tracking")
status, body = api_call("GET", "/progress")
test("Get progress records", status == 200, f"status={status}")
test("Progress has entries", isinstance(body, list) and len(body) >= 1, f"count={len(body) if isinstance(body, list) else 'N/A'}")
if isinstance(body, list) and len(body) > 0:
    entry = body[0]
    test("Progress has week_number", "week_number" in entry, f"keys={list(entry.keys())}")
    test("Progress has risk_score", "risk_score" in entry, f"keys={list(entry.keys())}")

# ── 8. REPORT GENERATION ─────────────────────────────────
print("\n🔹 Step 8: Report Generation")
status, body = api_call("GET", "/latest", base=REPORT_BASE)
test("Get latest report metadata", status == 200, f"status={status}, body={body}")
if isinstance(body, dict):
    test("Report has filename", "filename" in body, f"keys={list(body.keys())}")
    test("Report has pdf_url", "pdf_url" in body, f"keys={list(body.keys())}")
    test("Report has structured data", "data" in body, f"keys={list(body.keys())}")

# ── 9. CHAT ASSISTANT ────────────────────────────────────
print("\n🔹 Step 9: AI Chat Assistant")
status, body = api_call("POST", "/chat", {"message": "What foods are rich in iron for vegetarians?"})
test("Chat response received", status == 200, f"status={status}")
test("Chat has response text", isinstance(body, dict) and "response" in body and len(body.get("response", "")) > 20, 
     f"response length={len(body.get('response', '')) if isinstance(body, dict) else 'N/A'}")

# ── SUMMARY ──────────────────────────────────────────────
print("\n" + "=" * 70)
print(f"  RESULTS: {passed} passed, {failed} failed")
print("=" * 70)
if issues:
    print("\n  ⚠️ Issues Found:")
    for issue in issues:
        print(f"    • {issue}")
else:
    print("\n  🎉 All tests passed! The flow is working correctly.")
print()
