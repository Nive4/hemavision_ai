import numpy as np

class SentenceEmbeddingHelper:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            # Lightweight transformer model (384-dims)
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"SentenceTransformers load failed: {e}. Falling back to keyword search indexing.")
            self.model = None

    def get_embeddings(self, texts: list[str]) -> np.ndarray | None:
        """Computes embeddings for a list of string paragraphs"""
        if self.model is None:
            return None
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings
        except Exception as e:
            print(f"Error encoding embeddings: {e}")
            return None

    def get_embedding(self, text: str) -> np.ndarray | None:
        """Computes embedding for a single query text"""
        if self.model is None:
            return None
        try:
            return self.model.encode(text, convert_to_numpy=True)
        except Exception as e:
            print(f"Error encoding single query: {e}")
            return None
