"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GmailConnected() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white relative overflow-hidden p-8">
      {/* Background effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-3xl max-w-md w-full text-center space-y-6">
        {/* Animated check icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Gmail Connected!
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your account has been successfully linked. You can now generate emails and save them directly as Gmail drafts.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
          <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          Redirecting in {countdown}s...
        </div>

        <Link 
          href="/"
          className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
        >
          Return to Generator
        </Link>
      </div>
    </div>
  );
}
