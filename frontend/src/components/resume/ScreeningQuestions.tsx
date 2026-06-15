type Question = { skill: string; question: string; intent: string };

type Props = {
  questions: Question[];
  styles: Record<string, string>;
};

export default function ScreeningQuestions({ questions, styles }: Props) {
  return (
    <div className="glass-wrap">
      <div className={`glass-card ${styles.cardInner}`}>
        <div className={styles.cardTitle}>
          <div className={styles.cardIcon}>?</div>
          Screening Questions for Gaps
        </div>
        <div className={styles.qList}>
          {questions.map((q, i) => (
            <div key={i} className={styles.qRow}>
              <span className={styles.qSkill}>{q.skill}</span>
              <p className={styles.qText}>&ldquo;{q.question}&rdquo;</p>
              <p className={styles.qIntent}>{q.intent}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
