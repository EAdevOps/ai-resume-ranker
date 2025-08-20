export default function ResumeForm() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 md:p-10">
      {/* Placeholder content */}
      <div className="flex flex-col gap-4">
        <textarea
          className="min-h-[240px] rounded-xl border border-gray-200 p-3"
          placeholder="Resume input will go here..."
          disabled
        />
        <textarea
          className="min-h-[160px] rounded-xl border border-gray-200 p-3"
          placeholder="Job description input will go here..."
          disabled
        />
      </div>
    </div>
  );
}
