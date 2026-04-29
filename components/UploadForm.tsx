"use client";

import { useState } from "react";

interface EmailResult {
  subject: string;
  body: string;
  to_email: string | null;
}

interface PipelineResult {
  resume_data: any;
  job_data: any;
  search_data: any;
  context: any;
  email: EmailResult | null;
  pipeline_log: { step: string; status: string; duration_ms: number }[];
}

export default function UploadForm() {
  const [resume, setResume] = useState<File | null>(null);
  const [jdType, setJdType] = useState<"text" | "image">("text");
  const [jdText, setJdText] = useState("");
  const [jdImage, setJdImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPipelineResult(null);
    if (!resume) {
      setStatus("❌ Please upload a resume PDF.");
      return;
    }
    if (jdType === "text" && !jdText) {
      setStatus("❌ Please paste a job description.");
      return;
    }
    if (jdType === "image" && !jdImage) {
      setStatus("❌ Please upload a job description image.");
      return;
    }

    setLoading(true);
    setStatus("Uploading and processing (this may take 10-20 seconds)...");

    const formData = new FormData();
    formData.append("resume", resume);

    if (jdType === "text") {
      formData.append("job_description_text", jdText);
    } else if (jdImage) {
      formData.append("job_description_image", jdImage);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/process`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPipelineResult(data);
      setStatus(`✅ Success! Generated email ready.`);
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!pipelineResult?.email) return;
    setStatus("Saving to Gmail...");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const email = pipelineResult.email;

      const res = await fetch(`${apiUrl}/api/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: email.to_email || "",
          subject: email.subject,
          body: email.body,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail?.[0]?.msg || "Failed to save draft");
      }

      setStatus(`✅ Success! Draft saved to Gmail.`);
    } catch (err: any) {
      setStatus(`❌ Gmail Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-8">
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-6">

        {/* Resume Upload */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">1. Upload Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 p-2 border rounded-lg bg-white"
          />
        </div>

        {/* Job Description Type Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">2. Provide Job Description</label>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={jdType === "text"}
                onChange={() => setJdType("text")}
                className="accent-blue-600"
              />
              Text
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={jdType === "image"}
                onChange={() => setJdType("image")}
                className="accent-blue-600"
              />
              Image (Screenshot)
            </label>
          </div>

          {/* JD Text Input */}
          {jdType === "text" ? (
            <textarea
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg resize-none text-gray-800"
            ></textarea>
          ) : (
            /* JD Image Input */
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setJdImage(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 p-2 border rounded-lg bg-white"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-md"
        >
          {loading ? "Processing Pipeline..." : "Generate Email"}
        </button>

        {status && (
          <div className={`p-4 rounded-lg text-center mt-2 ${status.startsWith("✅") ? "bg-green-100 text-green-800 border border-green-200" : status.startsWith("Upload") || status.startsWith("Saving") ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
            {status}
          </div>
        )}
      </form>



      {/* Generated Email Display */}
      {pipelineResult?.email && (
        <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-4 animate-fade-in">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">✨ Generated Draft</h2>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 disabled:bg-red-300 transition-colors"
            >
              Save to Gmail Drafts
            </button>
          </div>

          {/* To & Subject */}
          <div className="mb-3 text-sm text-gray-500 space-y-1">
            <div><span className="font-semibold text-gray-700">To:</span> {pipelineResult.email.to_email || <span className="italic">No email found</span>}</div>
            <div><span className="font-semibold text-gray-700">Subject:</span> {pipelineResult.email.subject}</div>
          </div>

          {/* Body */}
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
            {pipelineResult.email.body}
          </pre>
        </div>
      )}
    </div>
  );
}
