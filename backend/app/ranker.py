import openai
from sentence_transformers import SentenceTransformer
import numpy as np
from collections import Counter
import re

class ResumeRanker:
    """
    ResumeRanker encapsulates TF-IDF computation, cosine similarity scoring,
    keyword extraction, skill extraction, and hybrid embedding scoring.
    """

    def __init__(self):
        pass

    def compute_tfidf(self, docs):
        N = len(docs)
        all_words = set()
        for doc in docs:
            all_words.update(self.tokenize(doc))
        all_words = list(all_words)
        tf = np.zeros((N, len(all_words)))
        for i, doc in enumerate(docs):
            words = self.tokenize(doc)
            word_counts = Counter(words)
            for j, word in enumerate(all_words):
                tf[i, j] = word_counts[word] / len(words) if len(words) > 0 else 0
        df = np.zeros(len(all_words))
        for j, word in enumerate(all_words):
            df[j] = sum(1 for doc in docs if word in self.tokenize(doc))
        idf = np.log((N + 1) / (df + 1)) + 1
        tfidf = tf * idf
        return tfidf, all_words

    def tokenize(self, text):
        return re.findall(r'\b\w+\b', text.lower())

    def score(self, resume, job):
        tfidf, _ = self.compute_tfidf([resume, job])
        v1, v2 = tfidf[0], tfidf[1]
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0
        similarity = np.dot(v1, v2) / (norm1 * norm2)
        return round(similarity * 100, 2)

    def get_matched_keywords(self, resume, job):
        resume_words = set(self.tokenize(resume))
        job_words = set(self.tokenize(job))
        return list(job_words & resume_words)

    def get_missing_keywords(self, resume, job):
        resume_words = set(self.tokenize(resume))
        job_words = set(self.tokenize(job))
        return list(job_words - resume_words)

    def embedding_score(self, resume, job):
        """
        Calculates semantic similarity using sentence embeddings.
        """
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embeddings = model.encode([resume, job])
        v1, v2 = embeddings[0], embeddings[1]
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0
        similarity = np.dot(v1, v2) / (norm1 * norm2)
        return round(similarity * 100, 2)

    def extract_skills(self, text, skill_list=None):
        """
        Extracts skills from text based on a provided skill list.
        """
        if skill_list is None:
            skill_list = [
                "python", "java", "sql", "excel", "project management",
                "communication", "leadership", "machine learning", "data analysis"
            ]
        text_lower = text.lower()
        found_skills = [skill for skill in skill_list if skill in text_lower]
        return found_skills

    def hybrid_embedding_score(self, resume, job, api_key=None):
        """
        Tries OpenAI embedding first; falls back to sentence-transformers if OpenAI fails or no API key.
        Always returns a numeric score (never None).
        """
        try:
            if api_key:
                openai.api_key = api_key
                def get_embedding(text):
                    response = openai.embeddings.create(
                        input=text,
                        model="text-embedding-ada-002"
                    )
                    return np.array(response.data[0].embedding)
                v1 = get_embedding(resume)
                v2 = get_embedding(job)
                norm1 = np.linalg.norm(v1)
                norm2 = np.linalg.norm(v2)
                if norm1 == 0 or norm2 == 0:
                    return 0
                similarity = np.dot(v1, v2) / (norm1 * norm2)
                return round(similarity * 100, 2)
        except Exception as e:
            print(f"OpenAI embedding failed: {e}")
        # Fallback to sentence-transformers
        try:
            model = SentenceTransformer("all-MiniLM-L6-v2")
            embeddings = model.encode([resume, job])
            v1, v2 = embeddings[0], embeddings[1]
            norm1 = np.linalg.norm(v1)
            norm2 = np.linalg.norm(v2)
            if norm1 == 0 or norm2 == 0:
                return 0
            similarity = np.dot(v1, v2) / (norm1 * norm2)
            return round(similarity * 100, 2)
        except Exception as e:
            print(f"Sentence-transformers embedding failed: {e}")
            return 0