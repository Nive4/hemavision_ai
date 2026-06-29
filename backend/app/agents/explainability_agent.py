from backend.app.agents.base_agent import BaseAgent
from backend.app.ml.shap_explainer import SymptomShapExplainer
from backend.app.ml.symptom_model import SymptomModel

class ExplainabilityAgent(BaseAgent):
    def __init__(self):
        super().__init__("ExplainabilityAgent", "Computes SHAP and Grad-CAM explainability artifacts.")
        self.shap_explainer = SymptomShapExplainer(SymptomModel())

    def execute(self, task_input: dict) -> dict:
        """
        Input keys:
            - symptoms (dict | None)
            - modalities (dict) - Output of VisionAgent (containing scores & gradcam filenames)
        """
        results = {"shap": {}, "gradcam_insights": {}}
        
        # 1. Symptom SHAP feature attributions
        symptoms = task_input.get("symptoms")
        if symptoms:
            results["shap"] = self.shap_explainer.explain(symptoms)
            
        # 2. Vision Grad-CAM explanation annotations
        modalities = task_input.get("modalities", {})
        for mod, info in modalities.items():
            score = info.get("score", 0.0)
            if mod == "eye":
                insight = "High pallor in the palpebral conjunctiva capillaries usually indicates lower hemoglobin concentrations."
            elif mod == "nail":
                insight = "Lightness in the nail bed denotes reduction in red blood cell volume."
            else: # tongue
                insight = "Smoothening and color loss on the tongue surface can relate to iron deficiency glossitis."
            
            results["gradcam_insights"][mod] = {
                "score": score,
                "gradcam_url": f"/uploads/{info.get('gradcam')}",
                "insight": insight
            }
            
        return results
