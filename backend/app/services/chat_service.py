from backend.app.rag.retriever import RAGRetriever

class ChatService:
    def __init__(self):
        self.retriever = RAGRetriever()

    def answer_question(self, query: str, user_risk_level: str | None = None, user_dietary_habit: str | None = None) -> dict:
        """
        Executes semantic search over indexed documents and appends patient-specific context.
        """
        # Formulate patient context summary string
        context_injected = ""
        if user_risk_level:
            diet_pref = user_dietary_habit or "omnivore"
            context_injected = f"Patient has {user_risk_level} Anemia Risk and follows a {diet_pref} diet."
            
        # Run RAG retriever
        rag_output = self.retriever.retrieve_and_synthesize(query, context_injected)
        
        answer = rag_output["answer"]
        
        # Append personalized diagnostic warnings or advice at the end of the text
        if user_risk_level:
            diet_pref = user_dietary_habit or "omnivore"
            answer += f"\n\n---\n\n### 🩺 Personalized Anemia Care Context\n"
            answer += f"Your current profile indicates a **{user_risk_level} Risk Level** under a **{diet_pref}** diet.\n"
            if user_risk_level == "Normal":
                answer += "Indicators look healthy. Maintain natural iron levels with daily green leafy veggies, seeds, or animal proteins."
            elif user_risk_level == "Mild":
                answer += "Mild pallor indicators detected. Pair iron-dense foods with fresh Vitamin C sources (citrus, peppers) and avoid caffeinated teas within 2 hours of meals."
            elif user_risk_level == "Moderate":
                answer += "Moderate anemia risk detected. It is highly recommended to schedule a primary care check-up. Focus on iron-rich meals daily."
            elif user_risk_level == "Severe":
                answer += "⚠️ **Urgent recommendation:** Indicators show Severe Anemia Risk. Please consult a qualified medical professional immediately for a full clinical blood test. Dietary modifications should only supplement direct medical care."

        return {
            "answer": answer,
            "source": rag_output["source"],
            "context_injected": bool(user_risk_level)
        }

    def generate_response(self, query: str, user_risk_level: str | None = None, user_dietary_habit: str | None = None) -> str:
        """Helper compat method mapping to answer_question"""
        res = self.answer_question(query, user_risk_level, user_dietary_habit)
        return res["answer"]

