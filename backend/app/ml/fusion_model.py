import numpy as np

class FusionModel:
    def __init__(self):
        # Default base confidence weights for input channels
        self.base_weights = {
            "eye": 0.35,      # Eyelid conjunctiva (highly specific clinical biomarker)
            "nail": 0.25,     # Nail bed capillary beds
            "tongue": 0.15,   # Tongue papillae atrophy
            "symptom": 0.25   # Tabular clinical questionnaire risk
        }

    def fuse(
        self,
        eye_score: float | None = None,
        nail_score: float | None = None,
        tongue_score: float | None = None,
        symptom_score: float | None = None
    ) -> dict:
        """
        Calculates normalized weighted sensor fusion over active clinical modalities.
        """
        scores = {
            "eye": eye_score,
            "nail": nail_score,
            "tongue": tongue_score,
            "symptom": symptom_score
        }

        active_weights = {}
        active_scores = {}

        for k, v in scores.items():
            if v is not None:
                active_weights[k] = self.base_weights[k]
                active_scores[k] = v

        if not active_weights:
            return {
                "fusion_score": 0.0,
                "final_risk_level": "Normal",
                "weights_used": {}
            }

        weight_sum = sum(active_weights.values())
        normalized_weights = {k: v / weight_sum for k, v in active_weights.items()}

        fused_score = sum(active_scores[k] * normalized_weights[k] for k in active_scores)
        fused_score = round(float(fused_score), 2)

        # Map to clinical risk levels
        if fused_score < 25.0:
            risk_level = "Normal"
        elif fused_score < 50.0:
            risk_level = "Mild"
        elif fused_score < 75.0:
            risk_level = "Moderate"
        else:
            risk_level = "Severe"

        return {
            "fusion_score": fused_score,
            "final_risk_level": risk_level,
            "weights_used": {k: round(v, 2) for k, v in normalized_weights.items()}
        }
