type Props = {
  score: number;
  mode: "applicant" | "recruiter";
};

export default function ScoreRing({ score, mode }: Props) {
  const circumference = 376;
  const offset = circumference - (score / 100) * circumference;
  const gradId = mode === "recruiter" ? "gradRecruiter" : "gradApplicant";

  return (
    <div style={{ position: "relative", width: "150px", height: "150px" }}>
      <svg
        style={{ transform: "rotate(-90deg)", overflow: "visible" }}
        width="150"
        height="150"
        viewBox="0 0 150 150"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            {mode === "recruiter" ? (
              <>
                <stop offset="0%" stopColor="#736EFE" />
                <stop offset="100%" stopColor="#c084fc" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ff9de2" />
                <stop offset="100%" stopColor="#b8a0ff" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          cx="75"
          cy="75"
          r="60"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="8"
        />
        <circle
          cx="75"
          cy="75"
          r="60"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,157,226,0.4))" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "2.8rem",
            lineHeight: 1,
            background:
              mode === "recruiter"
                ? "linear-gradient(160deg, #fff 40%, #a78bfa)"
                : "linear-gradient(160deg, #fff 40%, #ff9de2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "var(--muted)",
            marginTop: "4px",
          }}
        >
          out of 100
        </span>
      </div>
    </div>
  );
}
