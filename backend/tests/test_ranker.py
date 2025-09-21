import pytest
import numpy as np
from app.ranker import ResumeRanker  

@pytest.fixture
def ranker():
    return ResumeRanker()  # Instantiate the class

def test_tokenize(ranker):
    text = "Experienced Python developer."
    tokens = ranker.tokenize(text)
    assert tokens == ['experienced', 'python', 'developer']  # Basic tokenization check

def test_score(ranker):
    resume_text = "Experienced Python developer with FastAPI and machine learning skills."
    job_desc = "Seeking Python engineer proficient in APIs and AI."
    score = ranker.score(resume_text, job_desc)
    assert 0 <= score <= 100  # Score should be between 0 and 100
    assert score > 0  # Expect some positive match for this example

def test_get_matched_keywords(ranker):
    resume_text = "Python FastAPI machine learning"
    job_desc = "Python APIs AI"
    matched = ranker.get_matched_keywords(resume_text, job_desc)
    assert 'python' in matched  # Case-insensitive tokenization

def test_get_missing_keywords(ranker):
    resume_text = "Python FastAPI"
    job_desc = "Python APIs AI"
    missing = ranker.get_missing_keywords(resume_text, job_desc)
    assert 'ai' in missing
    assert 'apis' in missing

def test_embedding_score(ranker):
    resume_text = "Experienced Python developer with FastAPI and machine learning skills."
    job_desc = "Seeking Python engineer proficient in APIs and AI."
    score = ranker.embedding_score(resume_text, job_desc)
    assert 0 <= score <= 100  # Score should be between 0 and 100
    assert score > 50  # Expect reasonable semantic match

def test_extract_skills(ranker):
    text = "Skills: python, java, sql, communication"
    skills = ranker.extract_skills(text)
    assert "python" in skills
    assert "java" in skills
    assert "sql" in skills
    assert "communication" in skills

def test_hybrid_embedding_score_fallback(ranker):
    resume_text = "Experienced Python developer with FastAPI and machine learning skills."
    job_desc = "Seeking Python engineer proficient in APIs and AI."
    # Test with no API key to force fallback to sentence-transformers
    score = ranker.hybrid_embedding_score(resume_text, job_desc, api_key=None)
    assert 0 <= score <= 100  # Score should be between 0 and 100
    assert score > 50  # Expect reasonable match

def test_hybrid_embedding_score_with_invalid_key(ranker):
    resume_text = "text"
    job_desc = "text"
    # Test with invalid API key to simulate OpenAI failure and fallback
    score = ranker.hybrid_embedding_score(resume_text, job_desc, api_key="invalid_key")
    assert score == 100  # Identical texts should score perfectly on fallback

def test_compute_tfidf(ranker):
    docs = ["doc one", "doc two"]
    tfidf, all_words = ranker.compute_tfidf(docs)
    assert tfidf.shape == (2, len(all_words))  # Check matrix dimensions
    assert np.all(tfidf >= 0)  # TF-IDF values should be non-negative