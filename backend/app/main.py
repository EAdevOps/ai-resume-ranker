from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .ranker import ResumeRanker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Health check endpoint.
    Returns a simple message indicating the backend is running.
    """
    return {"message": "Backend is running"}

@app.post("/match")
def match_resume(jobPosting: str = Body(...), resumeText: str = Body(...)):
    """
    Matches a resume against a job posting and returns a similarity score,
    matched keywords, and missing keywords.

    Args:
        jobPosting (str): The job description text.
        resumeText (str): The resume text.

    Returns:
        dict: Contains 'rating' (score), 'matched' (keywords), and 'missing' (keywords).
    """
    if not jobPosting.strip() or not resumeText.strip():
        raise HTTPException(status_code=400, detail="jobPosting and resumeText cannot be empty")
    ranker = ResumeRanker()
    score = ranker.score(resumeText, jobPosting)
    matched = ranker.get_matched_keywords(resumeText, jobPosting)
    missing = ranker.get_missing_keywords(resumeText, jobPosting)
    return {"rating": score, "matched": matched, "missing": missing}