import UploadForm from "@/components/UploadForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center">AI Cold Email Generator</h1>
        
        <UploadForm />
        
      </div>
    </main>
  );
}
