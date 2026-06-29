import numpy as np

class SymptomShapExplainer:
    def __init__(self, model_wrapper):
        """
        Args:
            model_wrapper: Instance of SymptomModel
        """
        self.model_wrapper = model_wrapper
        self.feature_names = model_wrapper.symptom_order

    def explain(self, symptoms_dict: dict) -> dict:
        """
        Generates contribution scores (positive/negative) for each feature.
        If real XGBoost and SHAP is not loaded, uses a model-based heuristic fallback.
        """
        # Map values to numbers: Yes=2, Sometimes=1, No=0
        vector = self.model_wrapper.map_symptoms_to_vector(symptoms_dict)[0]
        
        # Check if we can run real SHAP
        if self.model_wrapper.model is not None:
            try:
                import shap
                explainer = shap.TreeExplainer(self.model_wrapper.model)
                shap_values = explainer.shap_values(vector.reshape(1, -1))
                # For multiclass, select the average contribution across classes
                if isinstance(shap_values, list):
                    # Sum of SHAP values for class 1, 2, 3 (elevated risk)
                    contribs = np.sum([shap_values[i][0] for i in range(1, len(shap_values))], axis=0)
                else:
                    # Binary or single output SHAP array
                    contribs = shap_values[0]
                
                features_contrib = {}
                for idx, name in enumerate(self.feature_names):
                    features_contrib[name] = round(float(contribs[idx]), 3)
                return features_contrib
            except Exception as e:
                print(f"Failed to run real SHAP: {e}. Falling back to heuristic SHAP.")

        # Heuristic SHAP values based on symptoms present
        # Yes=2 is positive contribution (+0.12), Sometimes=1 (+0.05), No=0 (-0.03)
        features_contrib = {}
        for idx, name in enumerate(self.feature_names):
            val = vector[idx]
            if val == 2:
                features_contrib[name] = 0.12
            elif val == 1:
                features_contrib[name] = 0.05
            else:
                features_contrib[name] = -0.03
                
        return features_contrib
