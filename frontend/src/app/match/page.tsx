"use client";

import { useState } from "react";
import styles from "./page.module.css";
import ScoreRing from "@/components/resume/ScoreRing";
import SkillBreakdown from "@/components/resume/SkillBreakdown";
import CategoryBars from "@/components/resume/CategoryBars";
import ScreeningQuestions from "@/components/resume/ScreeningQuestions";
import Suggestions from "@/components/resume/Suggestions";

type Mode = "applicant" | "recruiter";
type Screen = "role" | "applicant" | "recruiter";

type Skill = { name: string; status: "match" | "partial" | "missing" };
type Category = { label: string; score: number };
type ScreeningQuestion = { skill: string; question: string; intent: string };
type Suggestion = { type: "add" | "warn" | "tip"; title: string; body: string };

type AnalysisResult = {
  score: number;
  verdict: { applicant: string; recruiter: string };
  verdictDesc: { applicant: string; recruiter: string };
  stats: {
    skillsMatched: string;
    missingKeywords: string;
    experienceFit: string;
    education: string;
  };
  skills: Skill[];
  categories: Category[];
  screeningQuestions: ScreeningQuestion[];
  suggestions: Suggestion[] | string[]; // structured or plain strings from Claude
};

export default function MatchPage() {
  const [screen, setScreen] = useState<Screen>("role");
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPosting: jobDesc,
          resumeText: resume,
          mode: screen,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch {
      setError(
        "Analysis failed. Make sure the backend is running and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setScreen("role");
    setResult(null);
    setError(null);
    setLoading(false);
  }

  // Normalise suggestions — Claude may return plain strings or structured objects.
  // Always convert to the shape Suggestions component expects.
  function normaliseSuggestions(raw: Suggestion[] | string[]): Suggestion[] {
    if (!raw || raw.length === 0) return [];
    if (typeof raw[0] === "string") {
      return (raw as string[]).map((s) => ({
        type: "tip" as const,
        title: "",
        body: s,
      }));
    }
    return raw as Suggestion[];
  }

  const isRec = screen === "recruiter";

  return (
    <main className="page-content">
      {/* ── ROLE PICKER ── */}
      {screen === "role" && (
        <div className={styles.rolePicker}>
          <p className={`eyebrow ${styles.roleEyebrow}`}>Step 1 of 2</p>
          <h2 className={styles.roleTitle}>Who are you today?</h2>
          <p className={styles.roleSubtitle}>
            Tell us your role and we'll tailor the experience to what matters
            most to you.
          </p>
          <div className={styles.roleGrid}>
            {[
              {
                mode: "applicant" as Mode,
                emoji: "🎯",
                title: "I'm an Applicant",
                desc: "See how well my resume matches a job description and get tips to improve my score.",
                arrow: "Enter as applicant →",
              },
              {
                mode: "recruiter" as Mode,
                emoji: "🔍",
                title: "I'm a Recruiter",
                desc: "Evaluate a candidate's resume and get screening questions for any gaps found.",
                arrow: "Enter as recruiter →",
              },
            ].map((r) => (
              <div
                className="glass-wrap"
                key={r.mode}
                onClick={() => {
                  setScreen(r.mode);
                  setResume("");
                  setJobDesc("");
                  setResult(null);
                  setError(null);
                }}
              >
                <div className={`glass-card ${styles.roleCard}`}>
                  <span className={styles.roleEmoji}>{r.emoji}</span>
                  <h3 className={styles.roleCardTitle}>{r.title}</h3>
                  <p className={styles.roleCardDesc}>{r.desc}</p>
                  <span className={styles.roleArrow}>{r.arrow}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TOOL VIEW ── */}
      {(screen === "applicant" || screen === "recruiter") && (
        <>
          <div className={styles.toolHeader}>
            <button className={styles.backBtn} onClick={handleBack}>
              ← Back
            </button>
            <div>
              <span
                className={`badge badge-teal ${isRec ? styles.roleTagRecruiter : ""}`}
              >
                {isRec ? "// recruiter mode" : "// applicant mode"}
              </span>
            </div>
            <h1 className={styles.toolTitle}>
              {isRec ? "Screen smarter with " : "Does your resume "}
              <span className="chrome-text-animated">
                {isRec ? "AI-driven insights" : "actually get the job?"}
              </span>
            </h1>
            <p className={styles.toolSubtitle}>
              {isRec
                ? "Paste a candidate's resume and the job description. Get a match score, skill gaps, and targeted screening questions."
                : "Paste your resume and the job description. Get a match score, skill breakdown, and targeted improvements."}
            </p>
          </div>

          {/* Inputs */}
          <div className={styles.inputSection}>
            <div className={styles.panels}>
              <div className="glass-wrap">
                <div className="glass-card">
                  <div className={styles.panelHeader}>
                    <div className={styles.panelLabel}>
                      <span
                        className={`gem ${isRec ? "gem-rose" : "gem-teal"}`}
                      />
                      {isRec ? "Candidate Resume" : "Your Resume"}
                    </div>
                    <button
                      className={styles.panelClear}
                      onClick={() => setResume("")}
                    >
                      clear
                    </button>
                  </div>
                  <div className={styles.tabRow}>
                    <button className={`${styles.tabBtn} ${styles.active}`}>
                      Paste text
                    </button>
                    <button className={styles.tabBtn}>Upload PDF</button>
                  </div>
                  <textarea
                    className={styles.textarea}
                    placeholder={
                      isRec
                        ? "Paste the candidate's resume here…"
                        : "Paste your resume here — experience, skills, education…"
                    }
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                </div>
              </div>

              <div className="glass-wrap">
                <div className="glass-card">
                  <div className={styles.panelHeader}>
                    <div className={styles.panelLabel}>
                      <span className="gem gem-violet" />
                      Job Description
                    </div>
                    <button
                      className={styles.panelClear}
                      onClick={() => setJobDesc("")}
                    >
                      clear
                    </button>
                  </div>
                  <div className={styles.tabRow}>
                    <button className={`${styles.tabBtn} ${styles.active}`}>
                      Paste text
                    </button>
                    <button className={styles.tabBtn}>Upload PDF</button>
                  </div>
                  <textarea
                    className={styles.textarea}
                    placeholder="Paste the full job description here — requirements, responsibilities…"
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <div
                className={`btn-grad-wrap ${styles.ctaBtnWrap}`}
                onClick={!loading ? handleAnalyze : undefined}
              >
                <button
                  className="btn-grad-inner"
                  disabled={loading || !resume || !jobDesc}
                >
                  {loading
                    ? "Analyzing…"
                    : isRec
                      ? "Analyze Candidate →"
                      : "Analyze My Match →"}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <p className={styles.errorMsg}>{error}</p>}

          {/* Loading */}
          {loading && (
            <div className={styles.spinnerRow}>
              <div className="spinner" />
              <span className={styles.spinnerText}>
                Running analysis across 3 NLP layers…
              </span>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <>
              <div className="divider">
                <div className="divider-line" />
                <span className="divider-label">
                  {isRec ? "Candidate Analysis" : "Match Analysis"}
                </span>
                <div className="divider-line" />
              </div>

              <div className={styles.results}>
                <div className={styles.resultsGrid}>
                  {/* Score card */}
                  <div className="glass-wrap">
                    <div className="glass-card">
                      <div className={styles.scoreInner}>
                        <span className={styles.scoreEyebrow}>
                          {isRec ? "Candidate Score" : "Match Score"}
                        </span>
                        <ScoreRing score={result.score} mode={screen} />
                        <span
                          className={`badge ${isRec ? "badge-violet" : "badge-pink"}`}
                        >
                          {isRec
                            ? result.verdict.recruiter
                            : result.verdict.applicant}
                        </span>
                        <p className={styles.verdictDesc}>
                          {isRec
                            ? result.verdictDesc.recruiter
                            : result.verdictDesc.applicant}
                        </p>
                        <div className={styles.scoreStats}>
                          <div className={styles.sstat}>
                            <span className={styles.sstatLabel}>
                              Skills matched
                            </span>
                            <span className={`${styles.sstatVal} c-green`}>
                              {result.stats.skillsMatched}
                            </span>
                          </div>
                          <div className={styles.sstat}>
                            <span className={styles.sstatLabel}>
                              {isRec ? "Gaps to probe" : "Missing keywords"}
                            </span>
                            <span className={`${styles.sstatVal} c-rose`}>
                              {result.stats.missingKeywords}
                            </span>
                          </div>
                          <div className={styles.sstat}>
                            <span className={styles.sstatLabel}>
                              Experience fit
                            </span>
                            <span className={`${styles.sstatVal} c-violet`}>
                              {result.stats.experienceFit}
                            </span>
                          </div>
                          <div className={styles.sstat}>
                            <span className={styles.sstatLabel}>Education</span>
                            <span className={`${styles.sstatVal} c-green`}>
                              {result.stats.education}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right col */}
                  <div className={styles.rightCol}>
                    <SkillBreakdown skills={result.skills} styles={styles} />
                    <CategoryBars
                      categories={result.categories}
                      styles={styles}
                    />
                    {isRec && (
                      <ScreeningQuestions
                        questions={result.screeningQuestions}
                        styles={styles}
                      />
                    )}
                    {!isRec &&
                      result.suggestions &&
                      result.suggestions.length > 0 && (
                        <Suggestions
                          suggestions={normaliseSuggestions(result.suggestions)}
                          styles={styles}
                        />
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <footer>
        <span className="footer-label">
          rankiq ·{" "}
          {screen === "role" ? "resume intelligence" : `${screen} mode`}
        </span>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
