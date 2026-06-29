import os
import xgboost as xgb
import numpy as np
from backend.app.config import settings

class SymptomModel:
    def __init__(self):
        self.model_path = os.path.join(settings.MODEL_DIR, "symptom_model.json")
        self.model = None
        self.symptom_order = [
            "fatigue",
            "dizziness",
            "headache",
            "shortness_of_breath",
            "pale_skin",
            "cold_hands_feet",
            "weakness",
            "chest_pain",
            "brittle_nails",
            "tongue_soreness",
            "irregular_heartbeat",
            "poor_appetite",
            "craving_non_food",
            "difficulty_concentrating"
        ]
        self._load_model()

    def _load_model(self):
        """Load XGBoost model if weights exist, otherwise initialize a new one"""
        if os.path.exists(self.model_path):
            try:
                self.model = xgb.XGBClassifier()
                self.model.load_model(self.model_path)
            except Exception as e:
                print(f"Failed to load symptom model: {e}")
                self.model = None

    def map_symptoms_to_vector(self, symptoms_dict: dict) -> np.ndarray:
        """Map text responses to numeric values (yes=2, sometimes=1, no=0)"""
        vector = []
        for sym in self.symptom_order:
            val_str = symptoms_dict.get(sym, "no").lower()
            if val_str == "yes":
                val = 2
            elif val_str == "sometimes":
                val = 1
            else:
                val = 0
            vector.append(val)
        return np.array([vector])

    def predict(self, symptoms_dict: dict) -> dict:
        """
        Generate risk prediction from symptoms dict.
        Returns:
            dict containing risk_score, risk_level, and probability distribution
        """
        if not self.model:
            # Fallback heuristic if model not trained yet
            # Simply compute average score (yes=2, sometimes=1, no=0)
            vector = self.map_symptoms_to_vector(symptoms_dict)[0]
            max_score = len(self.symptom_order) * 2
            score_sum = sum(vector)
            percentage = round((score_sum / max_score) * 100, 2)
            
            if percentage < 25:
                lvl = "Normal"
              
            elif percentage < 50:
                lvl = "Mild"
            elif percentage < 75:
                lvl = "Moderate"
            else:
                lvl = "Severe"
                
            return {
                "risk_score": percentage,
                "risk_level": lvl,
                "probabilities": [1.0 - (percentage/100), percentage/300, percentage/300, percentage/300]
            }

        # Model inference
        X_input = self.map_symptoms_to_vector(symptoms_dict)
        probs = self.model.predict_proba(X_input)[0]  # Array of 4 probabilities

        # Expected value score: Normal (0.0), Mild (0.33), Moderate (0.66), Severe (1.0)
        # Scale to 0-100%
        expected_score = (probs[1] * 0.33 + probs[2] * 0.66 + probs[3] * 1.0) * 100
        risk_score = round(float(expected_score), 2)
        
        # Determine highest probability class or score-based tier
        # It is usually cleaner in medical UI to determine risk levels by score thresholds:
        if risk_score < 25:
            risk_level = "Normal"
        elif risk_score < 50:
            risk_level = "Mild"
        elif risk_score < 75:
            risk_level = "Moderate"
        else:
            risk_level = "Severe"
            
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "probabilities": [float(p) for p in probs]
        }
