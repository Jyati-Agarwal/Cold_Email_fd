"use client";

import { useState, useEffect } from "react";

// In a real app, this would come from an Auth provider.
// For now, we allow the user to see/change it to simulate different users.
const DEFAULT_USER_ID = "jyati_agarwal";

interface EmailResult {
  subject: string;
  body: string;
  to_email: string | null;
  gmail_connected?: boolean;
  candidate_name?: string;
  github_url?: string | null;
  linkedin_url?: string | null;
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
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [resume, setResume] = useState<File | null>(null);
  const [jdType, setJdType] = useState<"text" | "image">("text");
  const [jdText, setJdText] = useState("");
  const [jdImage, setJdImage] = useState<File | null>(null);
  
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Check Gmail status on load and when userId changes
  useEffect(() => {
    checkGmailStatus();
  }, [userId]);

  const checkGmailStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/auth/gmail/status?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setGmailConnected(data.connected);
      }
    } catch (e) {
      console.error("Failed to check Gmail status", e);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

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
    setStatus("Generating your personalized email...");

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("user_id", userId);

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
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setPipelineResult(data);
      if (data.email?.gmail_connected !== undefined) {
        setGmailConnected(data.email.gmail_connected);
      }
      setStatus(null);
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Navigate directly — the backend will 302 redirect to Google's OAuth consent screen
    window.location.href = `${apiUrl}/api/auth/gmail/connect?user_id=${encodeURIComponent(userId)}`;
  };

  const handleDisconnectGmail = async () => {
    if (!confirm("Disconnect Gmail? You will need to re-authorize to save drafts.")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/auth/gmail/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      setGmailConnected(false);
      setStatus("✅ Gmail disconnected.");
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleSaveDraft = async () => {
    if (!pipelineResult?.email) return;
    setLoading(true);
    setStatus("Saving to Gmail Drafts...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/email/save-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          recipient: pipelineResult.email.to_email || "",
          subject: pipelineResult.email.subject,
          body: pipelineResult.email.body,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setStatus("✅ Success! Draft saved to Gmail.");
    } catch (err: any) {
      setStatus(`❌ Gmail Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Form and Settings */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* User Card / Login Mock */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                {userId[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Active Session</p>
                <input 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="bg-transparent text-sm font-semibold focus:outline-none text-white border-b border-transparent hover:border-white/20 transition-all"
                  title="Change User ID"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {isRefreshingStatus ? (
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              ) : gmailConnected ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <button onClick={handleDisconnectGmail} className="text-[10px] text-gray-500 uppercase font-bold tracking-wider hover:text-red-400 transition-colors">
                    Gmail Linked
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleConnectGmail}
                  className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider hover:text-indigo-300 transition-colors border border-indigo-500/30 px-2 py-0.5 rounded"
                >
                  Link Gmail
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Inputs */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl space-y-8">
          
          {/* Resume Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
              <label className="text-sm font-semibold text-gray-300">Resume Analysis</label>
            </div>
            <div className={`relative group border-2 border-dashed transition-all rounded-2xl p-8 flex flex-col items-center justify-center gap-2 ${resume ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-white/20'}`}>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                {resume ? '📄' : '📤'}
              </div>
              <p className="text-sm text-gray-300 font-medium">{resume ? resume.name : 'Upload PDF Resume'}</p>
              <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">2</span>
                <label className="text-sm font-semibold text-gray-300">Job Description</label>
              </div>
              <div className="flex bg-white/5 p-1 rounded-lg">
                <button 
                  type="button" 
                  onClick={() => setJdType("text")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${jdType === 'text' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >TEXT</button>
                <button 
                  type="button" 
                  onClick={() => setJdType("image")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${jdType === 'image' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >IMAGE</button>
              </div>
            </div>

            {jdType === "text" ? (
              <textarea
                placeholder="Paste the full job posting here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
              ></textarea>
            ) : (
              <div className={`relative group border-2 border-dashed transition-all rounded-2xl p-8 flex flex-col items-center justify-center gap-2 ${jdImage ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-white/20'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setJdImage(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  {jdImage ? '🖼️' : '📸'}
                </div>
                <p className="text-sm text-gray-300 font-medium">{jdImage ? jdImage.name : 'Upload JD Screenshot'}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Synthesizing Pipeline..." : "Generate Magic Email"}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </form>

        {status && (
          <div className={`p-4 rounded-2xl text-xs font-medium border animate-in fade-in slide-in-from-top-2 ${
            status.startsWith("✅") ? "bg-green-500/10 border-green-500/20 text-green-400" : 
            status.startsWith("❌") ? "bg-red-500/10 border-red-500/20 text-red-400" : 
            "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          }`}>
            {status}
          </div>
        )}
      </div>

      {/* Right Column: Results Preview */}
      <div className="lg:col-span-7 h-full">
        {pipelineResult?.email ? (
          <div className="bg-[#111111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col h-full min-h-[600px]">
            {/* Fake Email Header */}
            <div className="bg-white/5 border-b border-white/5 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex gap-4">
                  {gmailConnected ? (
                    <button
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-tighter rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <span className="text-lg">📧</span> Save to Gmail
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGmail}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter rounded-full hover:bg-indigo-500 transition-colors"
                    >
                      Connect Gmail to Sync
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex border-b border-white/5 pb-2">
                  <span className="text-gray-500 w-16">To</span>
                  <span className="text-indigo-400 font-medium">{pipelineResult.email.to_email || "Not found (Placeholder)"}</span>
                </div>
                <div className="flex border-b border-white/5 pb-2">
                  <span className="text-gray-500 w-16">Subject</span>
                  <span className="text-gray-200 font-bold">{pipelineResult.email.subject}</span>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-8 flex-1 overflow-y-auto font-serif text-gray-300 leading-relaxed space-y-6">
              <div className="whitespace-pre-wrap">
                {pipelineResult.email.body}
              </div>
              
              {/* Profile Context Footer */}
              <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-600">
                <div>
                  <p className="uppercase mb-1 tracking-widest font-bold">Candidate</p>
                  <p className="text-gray-400">{pipelineResult.email.candidate_name || "Extracted Name"}</p>
                </div>
                <div className="flex gap-4 justify-end">
                  {pipelineResult.email.github_url && <a href={pipelineResult.email.github_url} className="hover:text-indigo-400">GitHub</a>}
                  {pipelineResult.email.linkedin_url && <a href={pipelineResult.email.linkedin_url} className="hover:text-indigo-400">LinkedIn</a>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[600px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-2xl text-gray-600 grayscale">
              ✉️
            </div>
            <div className="max-w-xs">
              <h3 className="text-gray-400 font-bold">No draft generated</h3>
              <p className="text-gray-600 text-xs">Fill in your resume and the job description to see the AI-generated preview here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
