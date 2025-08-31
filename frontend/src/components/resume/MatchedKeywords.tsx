export default function MatchedKeywords({ matched }: { matched: string[] }) {
  if (!matched.length) return null;
  return (
    <div>
      <h3 className="font-semibold text-green-700 mb-2">Matched Keywords</h3>
      <div className="flex flex-wrap gap-2">
        {matched.map((k) => (
          <span
            key={k}
            className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
