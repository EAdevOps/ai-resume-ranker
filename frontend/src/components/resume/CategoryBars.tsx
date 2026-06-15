type Category = { label: string; score: number };

type Props = {
  categories: Category[];
  styles: Record<string, string>;
};

function barColor(score: number): string {
  if (score >= 80) return "linear-gradient(90deg, #86efac, #34d399)";
  if (score >= 60) return "linear-gradient(90deg, #c4b5fd, #a78bfa)";
  return "linear-gradient(90deg, #fda4af, #fb7185)";
}

function barValColor(score: number): string {
  if (score >= 80) return "var(--green)";
  if (score >= 60) return "var(--violet)";
  return "var(--rose)";
}

export default function CategoryBars({ categories, styles }: Props) {
  return (
    <div className="glass-wrap">
      <div className={`glass-card ${styles.cardInner}`}>
        <div className={styles.cardTitle}>
          <div className={styles.cardIcon}>▲</div>
          Score by Category
        </div>
        <div className={styles.barList}>
          {categories.map((c) => (
            <div key={c.label} className={styles.barItem}>
              <div className={styles.barMeta}>
                <span className={styles.barLabel}>{c.label}</span>
                <span
                  className={styles.sstatVal}
                  style={{ color: barValColor(c.score) }}
                >
                  {c.score}%
                </span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${c.score}%`,
                    background: barColor(c.score),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
