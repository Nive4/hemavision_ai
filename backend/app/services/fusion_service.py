def fuse_results(
    eye_score: float | None = None,
    nail_score: float | None = None,
    tongue_score: float | None = None,
    symptom_score: float | None = None
) -> dict:
    """
    Fuse individual modality risk scores using dynamic weighted averaging.
    Standard Weights:
        - Eye: 0.35 (Primary biomarker)
        - Nails: 0.25
        - Tongue: 0.15
        - Symptoms: 0.25
    If any modality is missing, its weight is distributed proportionally.
    """
    base_weights = {
        "eye": 0.35,
        "nail": 0.25,
        "tongue": 0.15,
        "symptom": 0.25
    }
    
    scores = {
        "eye": eye_score,
        "nail": nail_score,
        "tongue": tongue_score,
        "symptom": symptom_score
    }
    
    active_weights = {}
    active_scores = {}
    
    for key, val in scores.items():
        if val is not None:
            active_weights[key] = base_weights[key]
            active_scores[key] = val
            
    if not active_weights:
        # Default fallback if everything is empty
        return {
            "fusion_score": 0.0,
            "final_risk_level": "Normal",
            "weights_used": {}
        }
        
    # Recalibrate weights to sum to 1.0
    weight_sum = sum(active_weights.values())
    normalized_weights = {k: v / weight_sum for k, v in active_weights.items()}
    
    # Calculate weighted fusion score
    fused_score = sum(active_scores[k] * normalized_weights[k] for k in active_scores)
    fused_score = round(fused_score, 2)
    
    # Determine risk level
    if fused_score < 25:
        risk_level = "Normal"
    elif fused_score < 50:
        risk_level = "Mild"
    elif fused_score < 75:
        risk_level = "Moderate"
    else:
        risk_level = "Severe"
        
    return {
        "fusion_score": fused_score,
        "final_risk_level": risk_level,
        "weights_used": {k: round(v, 2) for k, v in normalized_weights.items()}
    }

def generate_diet_plan(risk_level: str, dietary_habit: str) -> dict:
    """
    Generates tailored iron-rich meal recommendations based on risk severity and dietary preference.
    """
    habit = dietary_habit.lower()
    
    # Base lists of iron-rich foods
    veg_iron_sources = [
        "Spinach & Kale (cooked)",
        "Lentils, Chickpeas & Kidney Beans",
        "Pumpkin & Sesame Seeds",
        "Quinoa & Fortified Oatmeal",
        "Tofu & Tempeh",
        "Dark Chocolate (70%+)",
        "Dried Apricots & Raisins"
    ]
    
    nonveg_iron_sources = [
        "Chicken Liver & Beef",
        "Oysters & Clams",
        "Tuna & Salmon",
        "Eggs",
        "Turkey & Chicken Breast"
    ]
    
    vitamin_c_enhancers = [
        "Oranges & Strawberries",
        "Bell Peppers (Red/Yellow)",
        "Broccoli & Tomatoes",
        "Lemon juice dressing"
    ]
    
    calcium_inhibitors = [
        "Coffee & Black/Green Tea (avoid with meals)",
        "Milk, Yogurt & Cheese (consume 2 hours apart from iron)",
        "Antacids"
    ]

    # Combine sources based on habit
    if habit in ["veg", "vegan"]:
        primary_sources = veg_iron_sources
    else:
        primary_sources = nonveg_iron_sources + veg_iron_sources

    # Adjust recommendation wording based on risk level
    if risk_level == "Normal":
        summary = "Maintain current healthy intake with standard dietary iron."
        frequency = "Incorporate 1-2 iron-rich foods daily."
    elif risk_level == "Mild":
        summary = "Slightly low levels detected. Focus on boosting natural iron absorption."
        frequency = "Incorporate 2-3 iron-rich foods daily. Combine with Vitamin C."
    elif risk_level == "Moderate":
        summary = "Noticeable signs of iron deficit. Optimize iron intake and avoid absorption inhibitors."
        frequency = "Eat iron-rich foods at every meal. Avoid coffee/tea/dairy with meals."
    else: # Severe
        summary = "Critical anemia risk. Immediate medical consultation is required. Dietary changes should supplement clinical care."
        frequency = "Consult a physician for medical-grade iron supplements. Follow a rigorous iron-rich meal plan."

    return {
        "risk_level": risk_level,
        "summary": summary,
        "frequency": frequency,
        "iron_sources": primary_sources[:6],  # limit to top 6
        "vitamin_c_sources": vitamin_c_enhancers,
        "inhibitors_to_avoid": calcium_inhibitors
    }
