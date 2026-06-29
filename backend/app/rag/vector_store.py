import numpy as np
from backend.app.rag.knowledge_base import KnowledgeBaseLoader
from backend.app.rag.embeddings import SentenceEmbeddingHelper

class SimpleVectorStore:
    def __init__(self):
        self.loader = KnowledgeBaseLoader()
        self.embedder = SentenceEmbeddingHelper()
        
        self.documents = []
        self.embeddings = None
        self.initialize_index()

    def initialize_index(self):
        """Loads files and indexes them into vector space"""
        self.documents = self.loader.load_documents()
        if not self.documents:
            print("No documents loaded to index.")
            return

        texts = [doc["text"] for doc in self.documents]
        
        # Calculate dense representations
        self.embeddings = self.embedder.get_embeddings(texts)
        if self.embeddings is not None:
            print(f"Indexed {len(self.documents)} knowledge blocks into vector store.")
        else:
            print("Vector indexing failed. Initialized keyword index search fallback.")

    def search_keyword_fallback(self, query: str, top_k: int = 3) -> list[dict]:
        """Calculates simple word overlap score if SentenceTransformers is disabled"""
        query_words = set(query.lower().split())
        scored_docs = []
        
        for doc in self.documents:
            text_words = set(doc["text"].lower().split())
            overlap = len(query_words.intersection(text_words))
            scored_docs.append((overlap, doc))
            
        # Sort descending by match overlap
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k] if score > 0]

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        """Queries the vector index or runs keyword matching fallback"""
        if not self.documents:
            return []

        # Vector search route
        if self.embeddings is not None:
            query_vector = self.embedder.get_embedding(query)
            if query_vector is not None:
                # Cosine similarity calculations: dot product of normalized vectors
                # Normalize query vector
                query_norm = query_vector / (np.linalg.norm(query_vector) + 1e-10)
                # Normalize all document vectors
                doc_norms = self.embeddings / (np.linalg.norm(self.embeddings, axis=1, keepdims=True) + 1e-10)
                
                similarities = np.dot(doc_norms, query_norm)
                top_indices = np.argsort(similarities)[::-1][:top_k]
                
                results = []
                for idx in top_indices:
                    results.append({
                        "text": self.documents[idx]["text"],
                        "source": self.documents[idx]["source"],
                        "score": float(similarities[idx])
                    })
                return results

        # Fallback keyword matching route
        fallback_results = self.search_keyword_fallback(query, top_k)
        return [{"text": d["text"], "source": d["source"], "score": 1.0} for d in fallback_results]
