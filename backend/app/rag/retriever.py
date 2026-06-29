from backend.app.rag.vector_store import SimpleVectorStore

class RAGRetriever:
    def __init__(self):
        self.vector_store = SimpleVectorStore()

    def retrieve_and_synthesize(self, query: str, user_context: str = "") -> dict:
        """
        Retrieves matching contexts from vector store and packages it into
        an evidence-supported response payload.
        """
        matches = self.vector_store.search(query, top_k=2)
        
        if not matches:
            # General generic medical fallback response if no match in files
            answer = "Iron deficiency anemia is characterized by a low concentration of red blood cells or hemoglobin. Please ensure you are meeting your daily iron target (8-18mg/day) and consult your primary care doctor for a full blood panel."
            source = "General Clinical Guidance"
        else:
            # Construct a response synthesizing the matching paragraphs
            context_blocks = []
            sources = []
            for match in matches:
                context_blocks.append(match["text"])
                if match["source"] not in sources:
                    sources.append(match["source"])
            
            # Simulated local synthesis logic
            source_text = ", ".join(sources)
            context_joined = "\n\n".join(context_blocks)
            
            # Simple synthesis formatter based on retrieved text
            answer = f"Based on HemaVision clinical literature ({source_text}):\n\n"
            for block in context_blocks:
                # Format bullet points clean
                answer += f"- {block}\n"
            
            if user_context:
                answer += f"\n*Patient Context Note: {user_context}*"
            
            source = source_text

        return {
            "answer": answer,
            "source": source,
            "matches": matches
        }
