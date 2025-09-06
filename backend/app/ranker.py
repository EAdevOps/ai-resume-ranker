import numpy as np
from collections import Counter
import re

class ResumeRanker:
    def __init__(self):
        pass

    def compute_tfidf(self, docs):
        N = len(docs)
        all_words = set()
        for doc in docs:
            words = re.findall(r'\b\w+\b', doc.lower())
            all_words.update(words)
        word_list = list(all_words)
        tf = np.zeros((N, len(word_list)))
        df = np.zeros(len(word_list))
        for i, doc in enumerate(docs):
            words = re.findall(r'\b\w+\b', doc.lower())
            count = Counter(words)
            total = len(words)
            for j, word in enumerate(word_list):
                tf[i, j] = count[word] / total if total > 0 else 0
                if count[word] > 0:
                    df[j] += 1
        idf = np.log((N + 1) / (df + 1)) + 1
        tfidf = tf * idf
        return tfidf

    def cosine_similarity(self, v1, v2):
        dot = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        return dot / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0

    def score(self, resume_text, job_text):
        docs = [resume_text, job_text]
        tfidf = self.compute_tfidf(docs)
        sim = self.cosine_similarity(tfidf[0], tfidf[1])
        score = sim * 100
        return score

    def get_matched_keywords(self, resume_text, job_text):
        resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
        job_words = set(re.findall(r'\b\w+\b', job_text.lower()))
        return list(resume_words.intersection(job_words))

    def get_missing_keywords(self, resume_text, job_text):
        resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
        job_words = set(re.findall(r'\b\w+\b', job_text.lower()))
        return list(job_words - resume_words)