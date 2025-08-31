export default function RatingDisplay({ rating }: { rating: number | null }) {
  if (rating === null) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-2xl font-bold text-blue-800 text-center">
        Match Rating: {rating}%
      </h2>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div
          className="w-full bg-blue-100 rounded-full h-3 border border-blue-200"
          role="progressbar"
          aria-valuenow={rating}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, rating))}%` }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-gray-600">
          {rating}% match
        </div>
      </div>
    </div>
  );
}
