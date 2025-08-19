# AI Resume Ranker

AI Resume Ranker is a web-based application that evaluates how well a candidate’s resume aligns with a given job description.  
It combines **semantic similarity (OpenAI embeddings)** with **ATS-style keyword matching** to produce a score (0–100) and explanatory feedback.

---

## 📂 Repository Structure

ai-resume-ranker/
├── frontend/ # Next.js app (UI + simple APIs)
├── backend/ # FastAPI stub (for parsing/ML, optional Phase 2)
├── docs/ # Documentation (requirements, architecture, weekly plan)
└── .github/ # GitHub Actions workflows

---

```yaml
## 🚀 Tech Stack

### Frontend

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Zod for validation
- OpenAI API for embeddings

### Backend (planned, Phase 2)

- FastAPI (Python)
- spaCy, scikit-learn, PyMuPDF, python-docx
- sentence-transformers (or OpenAI API)
- Postgres (Neon/Supabase), SQLite for dev

### DevOps

- GitHub (repo, PR workflow, branch protection)
- GitHub Actions (CI: lint, build, test)
- Vercel (frontend CD)
- Render/Fly.io (backend CD)
- Env secrets in Vercel/Render

---

## 📑 Documentation

- [Requirements Specification](docs/requirements.md)
- [Architecture & System Requirements](docs/architecture.md)
- [Weekly Plan](docs/weekly-plan.md) _(to be filled out)_

---
```

## 🖥️ Development

### Prerequisites

- Node.js 18+ (20+ recommended)
- pnpm (or npm/yarn)
- Python 3.10+ (for backend)
- Git

### Getting Started (Frontend)

```bash
cd frontend
pnpm install
cp .env.example .env.local   # add your OpenAI API key
pnpm dev
```
