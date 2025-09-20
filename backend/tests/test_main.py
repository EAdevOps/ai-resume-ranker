import pytest
from fastapi.testclient import TestClient
from app.main import app  # FastAPI app

client = TestClient(app)

# Minimal valid PDF bytes for testing 
minimal_pdf_bytes = b'%PDF-1.1\n%\xc2\xa5\xc2\xb1\xc3\xab\n\n1 0 obj\n  << /Type /Catalog\n     /Pages 2 0 R\n  >>\nendobj\n\n2 0 obj\n  << /Type /Pages\n     /Kids [3 0 R]\n     /Count 1\n     /MediaBox [0 0 300 144]\n  >>\nendobj\n\n3 0 obj\n  <<  /Type /Page\n      /Parent 2 0 R\n      /Resources\n       << /Font\n           << /F1\n               << /Type /Font\n                  /Subtype /Type1\n                  /BaseFont /Times-Roman\n               >>\n           >>\n       >>\n      /Contents 4 0 R\n  >>\nendobj\n\n4 0 obj\n  << /Length 55 >>\nstream\n  BT\n    /F1 18 Tf\n    0 0 Td\n    (Fake resume content) Tj\n  ET\nendstream\nendobj\n\nxref\n0 5\n0000000000 65535 f \n0000000018 00000 n \n0000000077 00000 n \n0000000178 00000 n \n0000000457 00000 n \ntrailer\n  <<  /Root 1 0 R\n      /Size 5\n  >>\nstartxref\n565\n%%EOF'

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend is running"}

def test_match_resume():
    payload = {"jobPosting": "Python job", "resumeText": "Python dev"}
    response = client.post("/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "rating" in data
    assert "matched" in data
    assert "missing" in data
    assert 0 <= data["rating"] <= 100

def test_match_resume_empty_input():
    payload = {"jobPosting": "", "resumeText": ""}
    response = client.post("/match", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_semantic_match():
    payload = {"jobPosting": "Python job", "resumeText": "Python dev"}
    response = client.post("/semantic-match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "semantic_rating" in data
    assert 0 <= data["semantic_rating"] <= 100

def test_skills_match():
    payload = {"jobPosting": "Requires python and sql", "resumeText": "Skills: python, java"}
    response = client.post("/skills-match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "matched_skills" in data
    assert "missing_skills" in data
    assert "skills_score" in data
    assert 0 <= data["skills_score"] <= 100

def test_hybrid_semantic_match_no_key():
    payload = {"jobPosting": "Python job", "resumeText": "Python dev", "api_key": None}
    response = client.post("/hybrid-semantic-match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "hybrid_semantic_rating" in data
    assert 0 <= data["hybrid_semantic_rating"] <= 100

def test_hybrid_semantic_match_with_key():
    payload = {"jobPosting": "Python job", "resumeText": "Python dev", "api_key": "fake_key"}
    response = client.post("/hybrid-semantic-match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "hybrid_semantic_rating" in data
    assert 0 <= data["hybrid_semantic_rating"] <= 100

def test_upload_files():
    # Use valid minimal PDF bytes for both files
    files = {
        "resume_file": ("test_resume.pdf", minimal_pdf_bytes, "application/pdf"),
        "job_file": ("test_job.pdf", minimal_pdf_bytes, "application/pdf")
    }
    response = client.post("/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "resumeText" in data
    assert "jobPosting" in data
    assert "Fake resume content" in data["resumeText"]  # Check extracted text

def test_upload_files_unsupported_type():
    files = {
        "resume_file": ("test.txt", b"fake text", "text/plain"),
        "job_file": ("test.txt", b"fake text", "text/plain")
    }
    response = client.post("/upload", files=files)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_upload_resume():
    # Use valid minimal PDF bytes
    files = {"resume_file": ("test_resume.pdf", minimal_pdf_bytes, "application/pdf")}
    response = client.post("/upload-resume", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "resumeText" in data
    assert "Fake resume content" in data["resumeText"]  # Check extracted text

def test_upload_resume_unsupported_type():
    files = {"resume_file": ("test.txt", b"fake text", "text/plain")}
    response = client.post("/upload-resume", files=files)
    assert response.status_code == 400
    assert "detail" in response.json()