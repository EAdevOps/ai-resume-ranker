type Suggestion = { type: "add" | "warn" | "tip"; title: string; body: string };

type Props = {
  suggestions: Suggestion[];
  styles: Record<string, string>;
};

const ICON_MAP = { add: "+", warn: "!", tip: "→" } as const;
const CLASS_MAP = {
  add: "sIconAdd",
  warn: "sIconWarn",
  tip: "sIconTip",
} as const;

export default function Suggestions({ suggestions, styles }: Props) {
  return (
    <div className="glass-wrap">
      <div className={`glass-card ${styles.cardInner}`}>
        <div className={styles.cardTitle}>
          <div className={styles.cardIcon}>→</div>
          How to Improve
        </div>
        <div className={styles.suggestionList}>
          {suggestions.map((s, i) => (
            <div key={i} className={styles.suggestionRow}>
              <div className={`${styles.sIcon} ${styles[CLASS_MAP[s.type]]}`}>
                {ICON_MAP[s.type]}
              </div>
              <div>
                <span className={styles.suggestionStrong}>{s.title} </span>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
