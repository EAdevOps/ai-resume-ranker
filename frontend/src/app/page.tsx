"use client";

import { useState } from 'react';
import mammoth from 'mammoth';

export default function Home() {
  const [jobPosting, setJobPosting] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>(''); // For pasted resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [matchRating, setMatchRating] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    setMatchRating(null);

    let finalResumeText = resumeText;

    // Parse file if uploaded
    if (resumeFile) {
      try {
        if (resumeFile.name.endsWith('.pdf')) {
          finalResumeText = await parsePDF(resumeFile);
        } else if (resumeFile.name.endsWith('.docx')) {
          finalResumeText = await parseDOCX(resumeFile);
        } else {
          setError('Unsupported file type. Please upload PDF or DOCX.');
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        setError('Error parsing file. Please try again.');
        setIsProcessing(false);
        return;
      }
    }

    if (!jobPosting || !finalResumeText) {
      setError('Please provide both job posting and resume.');
      setIsProcessing(false);
      return;
    }

    // Use backend API with OpenAI for matching
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPosting, resumeText: finalResumeText }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const { rating } = await response.json();
      setMatchRating(rating);
    } catch (err) {
      setError('Error calculating match. Check API key and backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parsePDF = async (file: File): Promise<string> => {
    const pdfjs = await import('pdfjs-dist/webpack.mjs'); // Use webpack.mjs to handle bundler environments like Next.js
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.338/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text;
  };

  const parseDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Resume Ranker</h1>
      
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        {/* Job Posting Field */}
        <label htmlFor="job-posting" className="block text-lg font-medium mb-2 text-gray-800">
          Paste Job Posting Requirements:
        </label>
        <textarea
          id="job-posting"
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          className="w-full h-32 p-2 border border-gray-300 rounded mb-4 bg-gray-50 text-gray-900"
          placeholder="Paste the job description here..."
        />
        
        {/* Resume Input Section */}
        <label htmlFor="resume-paste" className="block text-lg font-medium mb-2 text-gray-800">
          Paste Resume Text:
        </label>
        <textarea
          id="resume-paste"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full h-32 p-2 border border-gray-300 rounded mb-4 bg-gray-50 text-gray-900"
          placeholder="Paste your resume text here (optional if uploading a file)..."
        />
        
        <label className="block text-lg font-medium mb-2 text-gray-800">
          Or Upload Resume File (PDF or DOCX):
        </label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          className="w-full mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200"
        />
        
        {/* Run Button */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing || (!jobPosting && !resumeText && !resumeFile)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isProcessing ? 'Processing...' : 'Run Resume Checker!'}
        </button>
        
        {/* Results and Errors */}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {matchRating !== null && (
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-blue-800">Match Rating: {matchRating}%</h2>
          </div>
        )}
      </div>
    </div>
  );
}