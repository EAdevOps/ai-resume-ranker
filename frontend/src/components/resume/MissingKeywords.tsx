export default function MissingKeywords({ missing }: { missing: string[] }) {
  if (!missing.length) return null;
  return (
    <div>
      <h3 className="font-semibold text-amber-700 mb-2">
        Missing / Consider Adding
      </h3>
      <div className="flex flex-wrap gap-2">
        {missing.map((k) => (
          <span
            key={k}
            className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
