type Skill = { name: string; status: "match" | "partial" | "missing" };

type Props = {
  skills: Skill[];
  styles: Record<string, string>;
};

export default function SkillBreakdown({ skills, styles }: Props) {
  return (
    <div className="glass-wrap">
      <div className={`glass-card ${styles.cardInner}`}>
        <div className={styles.cardTitle}>
          <div className={styles.cardIcon}>◆</div>
          Skill Breakdown
        </div>
        <div className={styles.legend}>
          {[
            { color: "var(--green)", label: "Matched" },
            { color: "var(--violet)", label: "Partial" },
            { color: "var(--rose)", label: "Missing" },
          ].map((l) => (
            <div key={l.label} className={styles.legendItem}>
              <div
                className={styles.legendPip}
                style={{ background: l.color }}
              />
              {l.label}
            </div>
          ))}
        </div>
        <div className={styles.skillsWrap}>
          {skills.map((s) => (
            <span key={s.name} className={`skill-tag ${s.status}`}>
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
