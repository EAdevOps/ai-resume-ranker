import io
import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Body, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from .ranker import ResumeRanker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://rankiq.ehsanali.dev",
    "https://ai-resume-ranker-pdyq4d484-ehsanali.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Backend is running"}


@app.post("/match")
def match_resume(
    jobPosting: str = Body(...),
    resumeText: str = Body(...),
    mode: str = Body(default="applicant"),   # "applicant" | "recruiter"
):
    if not jobPosting.strip() or not resumeText.strip():
        raise HTTPException(status_code=400, detail="jobPosting and resumeText cannot be empty")

    ranker = ResumeRanker()

    # ── Layers 1-4: extract, classify, clean, and generate suggestions ───────
    # Returns {"skills": [...], "suggestions": [...]}
    ai_result      = ranker.extract_keywords_from_jd(jobPosting, resumeText, mode=mode) or {}
    skills         = ai_result.get("skills", [])
    suggestions    = ai_result.get("suggestions", [])

    matched_skills = [s for s in skills if s["status"] == "match"]
    partial_skills = [s for s in skills if s["status"] == "partial"]
    missing_skills = [s for s in skills if s["status"] == "missing"]
    # Partials count as 0.6 — they represent real related experience
    skills_score   = round(
        (len(matched_skills) + 0.6 * len(partial_skills)) / max(len(skills), 1) * 100, 2
    )

    # ── Raw scores ───────────────────────────────────────────────────────────
    tfidf_score    = ranker.score(resumeText, jobPosting)
    semantic_score = ranker.embedding_score(resumeText, jobPosting)

    # ── Composite score ──────────────────────────────────────────────────────
    score = round(semantic_score * 0.5 + skills_score * 0.4 + tfidf_score * 0.1)

    # ── Verdict ──────────────────────────────────────────────────────────────
    if score >= 75:
        verdict      = {"applicant": "Strong Match",  "recruiter": "Strong Candidate"}
        verdict_desc = {
            "applicant": "Your profile aligns well. A few targeted additions could push this even higher.",
            "recruiter": "Good overall fit. Worth a screening call to probe any remaining gaps.",
        }
    elif score >= 50:
        verdict      = {"applicant": "Partial Match", "recruiter": "Potential Fit"}
        verdict_desc = {
            "applicant": "You meet several requirements but some key skills are missing from your resume.",
            "recruiter": "Candidate meets core criteria but has notable gaps worth exploring in interview.",
        }
    else:
        verdict      = {"applicant": "Weak Match",    "recruiter": "Weak Candidate"}
        verdict_desc = {
            "applicant": "Your resume doesn't align closely with this role. Consider targeting skills listed in the JD.",
            "recruiter": "Candidate shows limited alignment with the role requirements.",
        }

    # ── Stats ────────────────────────────────────────────────────────────────
    experience_fit = "Strong" if semantic_score >= 70 else "Partial" if semantic_score >= 45 else "Weak"

    education_keywords = ["bachelor", "master", "phd", "degree", "b.s", "m.s", "b.a", "m.a", "diploma"]
    edu_required = any(k in jobPosting.lower()  for k in education_keywords)
    edu_present  = any(k in resumeText.lower()  for k in education_keywords)
    education    = "Unclear" if not edu_required else ("Met" if edu_present else "Not Met")

    stats = {
        "skillsMatched":   f"{len(matched_skills)} / {len(skills)}",
        "missingKeywords": f"{len(missing_skills)} gaps",
        "experienceFit":   experience_fit,
        "education":       education,
    }

    # ── Category scores ──────────────────────────────────────────────────────
    soft_score = round(
        (len(matched_skills) + 0.5 * len(partial_skills)) / max(len(skills), 1) * 100
    )
    industry_words   = [w for w in ranker.tokenize(jobPosting) if len(w) > 5]
    industry_matched = [w for w in industry_words if w in ranker.tokenize(resumeText)]
    industry_score   = round(len(industry_matched) / max(len(industry_words), 1) * 100)

    categories = [
        {"label": "Technical Skills",      "score": round(skills_score)},
        {"label": "Work Experience",        "score": round(semantic_score * 0.8)},
        {"label": "Education",              "score": 95 if education == "Met" else 50 if education == "Unclear" else 20},
        {"label": "Soft Skills & Keywords", "score": soft_score},
        {"label": "Industry Language",      "score": min(industry_score, 100)},
    ]

    # ── Map suggestions to the right shape for the frontend ─────────────────
    # Recruiter → screeningQuestions (existing field, existing component)
    # Applicant → suggestions (new field for improvement bullets)
    if mode == "recruiter":
        # Claude returns [{"skill": ..., "question": ..., "intent": ...}]
        screening_questions = suggestions if isinstance(suggestions, list) and suggestions and isinstance(suggestions[0], dict) else []
        improvement_tips    = []
    else:
        # Claude returns ["Add X to skills section...", ...]
        screening_questions = []
        improvement_tips    = suggestions if isinstance(suggestions, list) else []

    return {
        "score":              score,
        "verdict":            verdict,
        "verdictDesc":        verdict_desc,
        "stats":              stats,
        "skills":             skills,
        "categories":         categories,
        "screeningQuestions": screening_questions,   # recruiter only — existing field
        "suggestions":        improvement_tips,       # applicant only — new field
    }


@app.post("/hybrid-semantic-match")
def hybrid_semantic_match(
    jobPosting: str = Body(...),
    resumeText: str = Body(...),
    api_key: str = Body(default=None)
):
    ranker  = ResumeRanker()
    api_key = api_key or os.getenv("OPENAI_API_KEY")
    score   = ranker.hybrid_embedding_score(resumeText, jobPosting, api_key)
    return {"hybrid_semantic_rating": score}


@app.post("/upload")
async def upload_files(
    resume_file: UploadFile = File(...),
    job_file:    UploadFile = File(...)
):
    async def extract_text(file: UploadFile):
        if file.filename.endswith(".pdf"):
            try:
                import fitz
                pdf_bytes = await file.read()
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                return "".join(page.get_text() for page in doc)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"PDF extraction error: {str(e)}")
        elif file.filename.endswith(".docx"):
            try:
                import docx
                doc_stream = io.BytesIO(await file.read())
                doc = docx.Document(doc_stream)
                return "\n".join(para.text for para in doc.paragraphs)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"DOCX extraction error: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and DOCX are allowed.")

    resume_text = await extract_text(resume_file)
    job_text    = await extract_text(job_file)
    return {"resumeText": resume_text, "jobPosting": job_text}