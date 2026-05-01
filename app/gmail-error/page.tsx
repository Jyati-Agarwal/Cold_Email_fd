"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function GmailErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "unknown";

  let errorMessage = "An unknown error occurred while connecting to Gmail.";
  if (reason === "invalid_code") {
    errorMessage = "Invalid authorization code received from Google.";
  } else if (reason === "exchange_failed") {
    errorMessage = "Failed to exchange authorization code for access tokens.";
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        ✕
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Connection Failed</h1>
      <p className="text-gray-600 mb-6">
        {errorMessage}
      </p>
      <Link 
        href="/"
        className="block w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return to Generator
      </Link>
    </div>
  );
}

export default function GmailError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <GmailErrorContent />
      </Suspense>
    </div>
  );
}
