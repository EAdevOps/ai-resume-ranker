"use client";

import React, { useState } from 'react';
import MissingKeywords from './MissingKeywords';
import RatingDisplay from './RatingDisplay';
import { motion } from 'framer-motion';  // Import framer-motion for animations

const ResumeForm: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobPosting, setJobPosting] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [matchRating, setMatchRating] = useState<number | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleResumeFileChange = async (file: File) => {
    setResumeFile(file);
    if (file) {
      setError(null);
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append('resume_file', file);

        const uploadResponse = await fetch('/api/upload-resume', {  // Assuming a backend endpoint for single resume upload; adjust if needed
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          setError(`Upload error: ${errorData.detail || 'Failed to process resume'}`);
          setIsProcessing(false);
          return;
        }
        const { resumeText: extractedResumeText } = await uploadResponse.json();
        if (!extractedResumeText?.trim()) {
          setError('Uploaded resume contains no extractable text. Please check the file.');
          setIsProcessing(false);
          return;
        }
        setResumeText(extractedResumeText);
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMatchRating(null);
    setMatched([]);
    setMissing([]);

    if (!jobPosting?.trim() || !resumeText?.trim()) {
      setError('Please provide both job posting and resume text.');
      return;
    }

    setIsProcessing(true);
    try {
      const matchResponse = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPosting, resumeText }),
      });
      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        setError(`Match error: ${errorData.detail || 'Failed to calculate match'}`);
        setIsProcessing(false);
        return;
      }
      const matchData = await matchResponse.json();
      setMatchRating(matchData.rating);
      setMatched(matchData.matched ?? []);
      setMissing(matchData.missing ?? []);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">AI Resume Ranker</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Posting</label>
          <textarea
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            placeholder="Paste the job posting text here..."
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume Text</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here or upload a file below to auto-populate..."
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF/DOCX) to Auto-Fill Text</label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => handleResumeFileChange(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {resumeFile && <p className="mt-2 text-sm text-gray-600">File "{resumeFile.name}" selected and parsed.</p>}
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isProcessing ? 'Processing...' : 'Run Resume Checker'}
        </button>
      </form>

      {error && <p className="text-red-600 text-center font-medium">{error}</p>}

      {matchRating !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <RatingDisplay rating={matchRating} />
            </motion.div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Missing / Consider Adding</h3>
              <MissingKeywords missing={missing} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Matched Words/Phrases</h3>
            <motion.ul
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {matched.length > 0 ? (
                matched.map((k, index) => (
                  <motion.li
                    key={index}
                    className="p-2 bg-green-100 rounded-md text-gray-700 font-medium shadow-sm hover:bg-green-200 transition-colors"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {k}
                  </motion.li>
                ))
              ) : (
                <p className="text-gray-500">No matched keywords found.</p>
              )}
            </motion.ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;