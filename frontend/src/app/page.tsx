import ResumeForm from "@/components/resume/ResumeForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Resume Ranker</h1>
      <div className="w-full max-w-2xl">
        <ResumeForm />
      </div>
    </div>
  );
}
