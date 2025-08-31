"use client";

import { useState } from "react";
import MatchedKeywords from "./MatchedKeywords";
import MissingKeywords from "./MissingKeywords";
import RatingDisplay from "./RatingDisplay";
import FileUploadNote from "./FileUploadNote";

export default function ResumeForm() {
  const [jobPosting, setJobPosting] = useState<string>("");
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null); // UI-only this week
  const [matchRating, setMatchRating] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    setMatchRating(null);
    setMatched([]);
    setMissing([]);

    if (!jobPosting || !resumeText) {
      setError("Please provide both job posting and resume (copy & paste).");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosting, resumeText }),
      });
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setMatchRating(data.rating ?? null);
      setMatched(data.matched ?? []);
      setMissing(data.missing ?? []);
    } catch {
      setError("Error calculating match (mock).");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 md:p-10">
      <div className="flex flex-col gap-4">
        {/* Resume input */}
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="min-h-[240px] rounded-xl border border-gray-200 p-3"
          placeholder="Paste your resume text here..."
        />

        {/* Job posting input */}
        <textarea
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          className="min-h-[160px] rounded-xl border border-gray-200 p-3"
          placeholder="Paste the job description here..."
        />

        {/* File upload (UI only for now) */}
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          className="w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200"
        />
        <FileUploadNote file={resumeFile} />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !jobPosting || !resumeText}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isProcessing ? "Processing..." : "Run Resume Checker!"}
        </button>

        {/* Error */}
        {error && <p className="mt-2 text-red-600">{error}</p>}

        {/* Results */}
        {matchRating !== null && (
          <div className="mt-4">
            <RatingDisplay rating={matchRating} />
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <MatchedKeywords matched={matched} />
              <MissingKeywords missing={missing} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
