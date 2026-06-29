import os
import re

class KnowledgeBaseLoader:
    def __init__(self, directory_path: str = None):
        if directory_path is None:
            # Default to data/knowledge relative to app root
            self.directory_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "knowledge")
        else:
            self.directory_path = directory_path

    def load_documents(self) -> list[dict]:
        """
        Reads all markdown documents in the knowledge directory.
        Segments them by headings or double newlines into chunks.
        
        Returns:
            list[dict]: List of document chunks with metadata.
        """
        chunks = []
        if not os.path.exists(self.directory_path):
            print(f"Knowledge directory {self.directory_path} does not exist.")
            return chunks

        for filename in os.listdir(self.directory_path):
            if filename.endswith(".md"):
                file_path = os.path.join(self.directory_path, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        
                    # Split content by markdown headings (e.g. ##) or double newlines
                    paragraphs = re.split(r'\n(?=#{1,4}\s)', content)
                    for idx, para in enumerate(paragraphs):
                        para_strip = para.strip()
                        if len(para_strip) > 40: # Skip short metadata lines
                            chunks.append({
                                "text": para_strip,
                                "source": filename,
                                "chunk_id": f"{filename}_{idx}"
                            })
                except Exception as e:
                    print(f"Error reading knowledge file {filename}: {e}")
                    
        return chunks
