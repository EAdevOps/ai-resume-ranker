weekly_plan_text = """# AI Resume Ranker – Weekly Plan

This plan outlines a 7-week timeline for the development of the AI Resume Ranker project.  
Each week has specific goals, deliverables, and ownership for a 4-person team.

---

## Week 1 – Setup & Scaffolding

- [x] Create repo with branch protection rules
- [x] Add `frontend/`, `backend/`, `docs/` structure
- [x] Scaffold Next.js app in `frontend/`
- [x] Write initial documentation (`requirements.md`, `architecture.md`, `README.md`)
- Deliverable: Running Next.js starter on localhost

## Week 2 – MVP Scoring Flow

- [ ] Add `/api/score` endpoint (embeddings + keyword scoring)
- [ ] Simple UI: two textareas (resume, job), “Score” button, result card
- [ ] Validate inputs and handle errors
- Deliverable: Paste resume + job description → get score & details

## Week 3 – File Upload Support

- [ ] Implement PDF/DOCX parsing (Node: `pdf-parse`, `mammoth`)
- [ ] Update UI to support file upload or paste
- [ ] Display parsed text before scoring
- Deliverable: User can upload resume files and receive score

## Week 4 – Python Backend Stub

- [ ] Scaffold FastAPI in `backend/`
- [ ] Expose `/parse` and `/score` endpoints (placeholder logic)
- [ ] Frontend switches to call FastAPI for scoring
- Deliverable: FastAPI returns basic score, integrated with frontend

## Week 5 – Advanced Scoring & Explainability

- [ ] Add skill taxonomy (tech stacks, roles)
- [ ] Highlight matched and missing keywords in results
- [ ] Store jobs/resumes/scores in Postgres via Prisma
- Deliverable: User sees score + rationale + highlighted feedback

## Week 6 – Polishing & Performance

- [ ] Improve UI (styling, responsiveness, accessibility)
- [ ] Add charts/graphs for score breakdown (optional)
- [ ] Optimize DB queries & request latency
- Deliverable: Polished, accessible demo with stable performance

## Week 7 – Testing & Final Presentation

- [ ] Unit + integration tests for scoring logic
- [ ] QA pass: error cases, upload limits, edge cases
- [ ] Prepare final docs and demo presentation
- Deliverable: Final version deployed (frontend on Vercel, backend on Render/Fly.io)

---

## Team Role Breakdown

- **Frontend Lead:** UI, Next.js routes, Tailwind components
- **Backend Lead:** FastAPI, parsing logic, API integration
- **ML Lead:** Scoring logic, embeddings, skill taxonomy
- **Docs/DevOps Lead:** Documentation, GitHub Actions, CI/CD, project management

"""

# Save into docs/weekly-plan.md

with open("docs/weekly-plan.md", "w", encoding="utf-8") as f:
f.write(weekly_plan_text)

"docs/weekly-plan.md created with 7-week plan and team roles."
