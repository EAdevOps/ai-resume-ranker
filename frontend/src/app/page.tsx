"use client";

import ResumeForm from "@/components/resume/ResumeForm";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-r from-emerald-400 to-cyan-400">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw] max-w-3xl">
          <ResumeForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
