import numpy as np
from collections import Counter
import re

class ResumeRanker:
    """
    ResumeRanker encapsulates TF-IDF computation, cosine similarity scoring,
    and keyword extraction for resume/job description matching.
    """

    def __init__(self):
        pass

    def compute_tfidf(self, docs):
        """
        Computes TF-IDF vectors for a list of documents.

        Args:
            docs (list of str): List containing resume and job description texts.

        Returns:
            tuple: (tfidf vectors as np.ndarray, word list)
        """
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
        idf = np.log((N + 1) / (df + 1)) + 1  # Smoothing
        tfidf = tf * idf
        return tfidf, word_list

    def score(self, resume, job):
        """
        Calculates the similarity score (0-100) between resume and job description.

        Args:
            resume (str): Resume text.
            job (str): Job description text.

        Returns:
            float: Similarity score (0-100).
        """
        tfidf, _ = self.compute_tfidf([resume, job])
        v1, v2 = tfidf[0], tfidf[1]
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0
        similarity = np.dot(v1, v2) / (norm1 * norm2)
        return round(similarity * 100, 2)

    def get_matched_keywords(self, resume, job):
        """
        Returns keywords present in both resume and job description.

        Args:
            resume (str): Resume text.
            job (str): Job description text.

        Returns:
            list: Matched keywords.
        """
        resume_words = set(re.findall(r'\b\w+\b', resume.lower()))
        job_words = set(re.findall(r'\b\w+\b', job.lower()))
        return list(resume_words & job_words)

    def get_missing_keywords(self, resume, job):
        """
        Returns keywords present in job description but missing from resume.

        Args:
            resume (str): Resume text.
            job (str): Job description text.

        Returns:
            list: Missing keywords.
        """
        resume_words = set(re.findall(r'\b\w+\b', resume.lower()))
        job_words = set(re.findall(r'\b\w+\b', job.lower()))
        return list(job_words - resume_words)