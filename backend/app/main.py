from fastapi import FastAPI, Body, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from .ranker import ResumeRanker
import io

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
    """Health check endpoint."""
    return {"message": "Backend is running"}

@app.post("/match")
def match_resume(jobPosting: str = Body(...), resumeText: str = Body(...)):
    """TF-IDF similarity, matched and missing keywords."""
    if not jobPosting.strip() or not resumeText.strip():
        raise HTTPException(status_code=400, detail="jobPosting and resumeText cannot be empty")
    ranker = ResumeRanker()
    score = ranker.score(resumeText, jobPosting)
    matched = ranker.get_matched_keywords(resumeText, jobPosting)
    missing = ranker.get_missing_keywords(resumeText, jobPosting)
    return {"rating": score, "matched": matched, "missing": missing}

@app.post("/semantic-match")
def semantic_match(jobPosting: str = Body(...), resumeText: str = Body(...)):
    """Semantic similarity using sentence-transformers."""
    ranker = ResumeRanker()
    score = ranker.embedding_score(resumeText, jobPosting)
    return {"semantic_rating": score}

@app.post("/skills-match")
def skills_match(jobPosting: str = Body(...), resumeText: str = Body(...)):
    """Extracts and matches skills between resume and job posting."""
    ranker = ResumeRanker()
    job_skills = ranker.extract_skills(jobPosting)
    resume_skills = ranker.extract_skills(resumeText, job_skills)
    matched = list(set(job_skills) & set(resume_skills))
    missing = list(set(job_skills) - set(resume_skills))
    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skills_score": round(len(matched) / max(len(job_skills), 1) * 100, 2)
    }

@app.post("/hybrid-semantic-match")
def hybrid_semantic_match(
    jobPosting: str = Body(...),
    resumeText: str = Body(...),
    api_key: str = Body(default=None)
):
    """
    Uses OpenAI embeddings if API key is provided and works,
    otherwise falls back to sentence-transformers.
    """
    ranker = ResumeRanker()
    score = ranker.hybrid_embedding_score(resumeText, jobPosting, api_key)
    return {"hybrid_semantic_rating": score}

@app.post("/upload")
async def upload_files(
    resume_file: UploadFile = File(...),
    job_file: UploadFile = File(...)
):
    """Accepts resume and job description files (PDF/DOCX), extracts text, and returns it."""
    async def extract_text(file: UploadFile):
        if file.filename.endswith(".pdf"):
            try:
                import fitz  # PyMuPDF
                pdf_bytes = await file.read()
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                text = ""
                for page in doc:
                    text += page.get_text()
                return text
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"PDF extraction error: {str(e)}")
        elif file.filename.endswith(".docx"):
            try:
                import docx
                doc_bytes = await file.read()
                doc_stream = io.BytesIO(doc_bytes)
                doc = docx.Document(doc_stream)
                text = "\n".join([para.text for para in doc.paragraphs])
                return text
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"DOCX extraction error: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and DOCX are allowed.")

    resume_text = await extract_text(resume_file)
    job_text = await extract_text(job_file)
    return {"resumeText": resume_text, "jobPosting": job_text}

@app.post("/upload-resume")
async def upload_resume(resume_file: UploadFile = File(...)):
    """Accepts a single resume file (PDF/DOCX), extracts text, and returns it."""
    async def extract_text(file: UploadFile):
        if file.filename.endswith(".pdf"):
            try:
                import fitz  # PyMuPDF
                pdf_bytes = await file.read()
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                text = ""
                for page in doc:
                    text += page.get_text()
                return text
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"PDF extraction error: {str(e)}")
        elif file.filename.endswith(".docx"):
            try:
                import docx
                doc_bytes = await file.read()
                doc_stream = io.BytesIO(doc_bytes)
                doc = docx.Document(doc_stream)
                text = "\n".join([para.text for para in doc.paragraphs])
                return text
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"DOCX extraction error: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and DOCX are allowed.")

    resume_text = await extract_text(resume_file)
    return {"resumeText": resume_text}