import UploadForm from "@/components/UploadForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background blobs for depth */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        {/* Header Section */}
        <header className="max-w-3xl w-full text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4">
            AI-Powered Recruitment Assistant
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Cold Emails <br /> <span className="text-indigo-400">That Convert.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Upload your resume, paste a job description, and let Gemini craft a personalized, 
            high-impact application. Directly sync with your Gmail drafts.
          </p>
        </header>

        {/* Main Interface */}
        <div className="w-full max-w-5xl">
          <UploadForm />
        </div>

        {/* Footer */}
        <footer className="mt-24 text-gray-600 text-sm flex gap-8 border-t border-white/5 pt-8 w-full justify-center">
          <span>&copy; 2024 Antigravity AI</span>
          <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
        </footer>
      </div>
    </main>
  );
}
