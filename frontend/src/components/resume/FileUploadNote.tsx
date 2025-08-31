export default function FileUploadNote({ file }: { file: File | null }) {
  if (file) {
    return (
      <p className="text-sm text-amber-700">
        File "{file.name}" selected. File parsing is{" "}
        <span className="font-semibold">coming soon</span> — please paste your
        resume text for now.
      </p>
    );
  }

  // Default note before file is selected
  return (
    <p className="text-sm text-amber-700">
      File parsing is <span className="font-semibold">coming soon</span> —
      please paste your resume text for now.
    </p>
  );
}
