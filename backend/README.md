# AI Resume Ranker Backend

This backend powers the AI Resume Ranker application, providing endpoints to compare a resume against a job description and return a similarity score, matched keywords, missing keywords, skill matches, and semantic similarity using AI.

## Setup

1. **Install dependencies:**
   ```bash
   python3 -m pip install -r requirements.txt
   ```

2. **Run the FastAPI server:**
   ```bash
   cd backend
   PYTHONPATH=. uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

### `GET /`
- **Description:** Health check endpoint.
- **Response:**  
  ```json
  { "message": "Backend is running" }
  ```

### `POST /match`
- **Description:** Compares resume and job description using TF-IDF, returning a similarity score and keyword analysis.
- **Request Body:**
  ```json
  {
    "jobPosting": "Looking for a Python developer with experience in Java and SQL.",
    "resumeText": "I am a Python developer with SQL skills."
  }
  ```
- **Response:**
  ```json
  {
    "rating": 36.85,
    "matched": ["a", "python", "developer", "with", "sql"],
    "missing": ["java", "for", "and", "in", "experience", "looking"]
  }
  ```

### `POST /semantic-match`
- **Description:** Returns a semantic similarity score using sentence-transformers.
- **Request Body:**
  ```json
  {
    "jobPosting": "Expert in machine learning and data analysis required.",
    "resumeText": "I have worked on machine learning projects and performed data analysis."
  }
  ```
- **Response:**
  ```json
  {
    "semantic_rating": 63.11
  }
  ```

### `POST /skills-match`
- **Description:** Extracts and matches skills between resume and job posting.
- **Request Body:**
  ```json
  {
    "jobPosting": "We need someone with Python, SQL, and project management experience.",
    "resumeText": "I am skilled in Python and SQL."
  }
  ```
- **Response:**
  ```json
  {
    "matched_skills": ["python", "sql"],
    "missing_skills": ["project management"],
    "skills_score": 66.67
  }
  ```

### `POST /hybrid-semantic-match`
- **Description:** Uses OpenAI embeddings if API key is provided and works, otherwise falls back to sentence-transformers.
- **Request Body:**
  ```json
  {
    "jobPosting": "We are looking for a candidate with strong Python and machine learning skills.",
    "resumeText": "I have experience in Python, data analysis, and machine learning.",
    "api_key": ""
  }
  ```
- **Response:**
  ```json
  {
    "hybrid_semantic_rating": 70.95
  }
  ```

### `POST /upload`
- **Description:** Accepts resume and job description files (PDF/DOCX), extracts text, and returns it.
- **Request Body:**  
  Upload two files: `resume_file` and `job_file` (PDF or DOCX).
- **Response:**
  ```json
  {
    "resumeText": "Extracted resume text...",
    "jobPosting": "Extracted job description text..."
  }
  ```

## Testing

Run unit tests with:
```bash
PYTHONPATH=backend python3 -m unittest app.test_ranker
```

## Project Structure

- `app/main.py` — FastAPI endpoints and backend integration.
- `app/ranker.py` — ResumeRanker class for TF-IDF scoring, skill extraction, and semantic similarity.
- `app/test_ranker.py` — Unit tests for backend logic.
- `requirements.txt` — Python dependencies.

## Description

Implements TF-IDF scoring, cosine similarity, skill extraction, and semantic similarity for resume/job matching. Designed for modularity and future extensibility (e.g., rubric-based subscores, OpenAI embeddings fallback).

## License

This project is for educational purposes (UMGC CMSC 495 Capstone).