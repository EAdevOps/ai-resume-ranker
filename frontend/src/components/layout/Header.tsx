export default function Header() {
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw] max-w-5xl py-4 flex items-center justify-center">
        <h1 className="text-xl sm:text-2xl font-semibold">AI Resume Ranker</h1>
      </div>
    </header>
  );
}
