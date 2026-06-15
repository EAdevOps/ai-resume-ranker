import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import openai
import anthropic
from sentence_transformers import SentenceTransformer
import numpy as np
from collections import Counter
import re
import json

api_key = os.getenv("OPENAI_API_KEY")


def _extract_and_classify_skills(job: str, resume: str, mode: str) -> dict:
    """
    Single Claude Haiku call that:
      1. Extracts up to 18 concrete skills/tools/certifications from the JD
      2. Classifies each as match / partial / missing against the resume
      3. Categorises each as tech or soft
      4. Returns 5 suggestions tailored to mode

    Token strategy:
      - JD truncated to 1200 chars (covers requirements section)
      - Resume truncated to 1200 chars
      - Compact JSON keys (n/s/c)
      - max_tokens 1000 to avoid truncated JSON
    """
    job_snippet    = job[:1200].strip()
    resume_snippet = resume[:1200].strip()

    if mode == "recruiter":
        suggestions_instruction = (
            '"suggestions": [{"skill":"X","question":"...","intent":"..."}]  '
            '// 5 screening questions for missing/partial skills'
        )
    else:
        suggestions_instruction = (
            '"suggestions": [{"type":"add"|"warn"|"tip","title":"short label","body":"actionable detail"}] '
            '// 5 improvement tips. type="add" for missing skills to gain, '
            '"warn" for gaps that may disqualify, "tip" for resume phrasing improvements'
        )

    prompt = (
        f"JD:\n{job_snippet}\n\n"
        f"RESUME:\n{resume_snippet}\n\n"
        "Tasks:\n"
        "1. Extract up to 18 CONCRETE skills, tools, certifications, or technologies "
        "that are explicitly required or preferred in the JD.\n"
        "   INCLUDE: named tools/software, programming languages, frameworks, databases, "
        "cloud platforms, certifications, clinical procedures, methodologies.\n"
        "   EXCLUDE: adjectives ('critical', 'strong'), verbs ('manage', 'operate'), "
        "generic nouns ('care', 'unit', 'family', 'readings'), company names, "
        "and any word that could appear in normal prose without a specific technical meaning.\n"
        "2. For each skill classify against the resume:\n"
        "   'match' = clearly present, 'partial' = related experience, 'missing' = absent.\n"
        "3. Add category: 'tech' or 'soft'.\n"
        "4. Sort by importance to the role (most critical first).\n"
        f"5. {suggestions_instruction}\n\n"
        "Reply ONLY with compact JSON, no markdown, no explanation:\n"
        '{"skills":[{"n":"python","s":"match","c":"tech"}],"suggestions":[...]}'
    )

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text.strip()
        print(f"[DEBUG] Claude raw response: {raw}")

        # Strip markdown fences — handles ```json, ```JSON, ``` variants
        raw = re.sub(r"^```[a-zA-Z]*\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw.strip())
        raw = raw.strip()

        data = json.loads(raw)

        skills = [
            {
                "name":     item["n"],
                "status":   item["s"],
                "category": "technical" if item["c"] == "tech" else "soft",
            }
            for item in data.get("skills", [])
        ]
        suggestions = data.get("suggestions", [])
        return {"skills": skills, "suggestions": suggestions}

    except Exception as e:
        import traceback
        print(f"[ERROR] Claude skill extraction failed: {e}")
        traceback.print_exc()
        return {"skills": [], "suggestions": []}


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
        """Calculates semantic similarity using sentence embeddings."""
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embeddings = model.encode([resume, job])
        v1, v2 = embeddings[0], embeddings[1]
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0
        similarity = np.dot(v1, v2) / (norm1 * norm2)
        return round(similarity * 100, 2)

    def extract_keywords_from_jd(self, job, resume, mode="applicant", top_n=18, partial_threshold=0.15):
        """
        Extracts up to top_n concrete skills from the JD and classifies them
        against the resume in a single Claude Haiku call.

        Returns dict:
          {
            "skills":      [{"name", "status", "category"}],
            "suggestions": [...] — strings (applicant) or dicts (recruiter)
          }
        """
        return _extract_and_classify_skills(job, resume, mode)

    def extract_skills(self, text, skill_list=None):
        """
        Extracts skills from text based on a provided skill list.
        Kept for backwards compatibility.
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
                        model="text-embedding-3-small"
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