# AI Resume Ranker – Requirements Specification

## Problem Statement

Job seekers struggle to understand how well their resumes align with specific job descriptions.
Existing Applicant Tracking Systems (ATS) filter resumes based on keywords, leaving candidates
without feedback. This project aims to provide a transparent AI-driven resume ranking system.

## Objectives

- Accept a resume (text or file) and a job description.
- Compute a similarity score (0–100) that reflects alignment.
- Provide explainability: show keyword matches, similarity metrics, and improvement areas.

## Scope

- **MVP**: Paste-in resume and job description → score + rationale.
- **Phase 2**: Upload PDF/DOCX parsing, section weighting, richer skill taxonomy, suggestions.
- **Out of scope**: End-to-end ATS replacement, automated job applications.

## Assumptions

- OpenAI API is available and stable for embeddings.
- Users will not upload files larger than 10 MB.
- Initial keyword taxonomy limited to common software engineering skills.

## Risks

- Dependency on OpenAI uptime and pricing.
- Potential parsing errors for diverse resume formats.
- Data privacy concerns (resume content must not be leaked/logged).

## Evaluation

- Accuracy of similarity scores (qualitative testing with sample resumes).
- Performance (<3s response time for paste flow).
- Usability (clear rationale provided to the user).
- Security/privacy compliance for handling sensitive documents.

## End-User System Requirements

The AI Resume Ranker is a web-based application. Most computation (embeddings, scoring, parsing) is handled in the backend or cloud services, so the user’s machine only needs to meet standard web app requirements.

### Minimum Requirements

- **Device:** Modern laptop or desktop (tablet supported but not primary target).
- **Processor (CPU):** Dual-core (Intel i3 / AMD Ryzen 3 or equivalent).
- **RAM:** 4 GB.
- **Storage:** ~200 MB free space (for browser cache and uploads).
- **Operating System:**
  - Windows 10 or newer
  - macOS 11 (Big Sur) or newer
  - Linux (Ubuntu 20.04+ or equivalent)
- **Browser:** Latest stable release of Chrome, Edge, Firefox, or Safari (must support ES6, Fetch API, WebAssembly).
- **Internet:** Stable broadband connection ≥ 2 Mbps.

### Recommended Requirements

- **Processor (CPU):** Quad-core (Intel i5 / AMD Ryzen 5 or equivalent).
- **RAM:** 8 GB.
- **Storage:** 500 MB free space.
- **Operating System:** Windows 11, macOS 12+, or recent Linux distribution.
- **Browser:** Latest Chrome or Edge.
- **Internet:** ≥ 10 Mbps for faster uploads and smoother interactions.

### Not Required

- **GPU:** No GPU needed on the user side (all ML/AI runs in the cloud).
- **Local ML frameworks:** Users don’t need TensorFlow, PyTorch, etc. installed.
- **Special OS features:** No admin rights or local installs beyond a browser.

### Special Notes

- **Mobile:** Responsive UI allows access via phones and tablets, but full resume editing and uploading works best on desktop.
- **Accessibility:** Designed to follow WCAG guidelines; screen readers, high-contrast mode, and keyboard navigation will be supported.
