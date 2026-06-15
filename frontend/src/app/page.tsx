import Link from "next/link";
import styles from "./page.module.css";

const FEATURES = [
  {
    icon: "◆",
    iconClass: styles.featIconTeal,
    title: "Instant Match Score",
    desc: "AI compares your resume against any job description and returns a precise match score with a full breakdown by category.",
  },
  {
    icon: "⚡",
    iconClass: styles.featIconViolet,
    title: "Skill Gap Analysis",
    desc: "See exactly which skills are matched, partially met, or missing so you know where to focus before applying.",
  },
  {
    icon: "→",
    iconClass: styles.featIconRose,
    title: "Actionable Suggestions",
    desc: "Get specific, prioritized recommendations on how to close the gap and push your score higher.",
  },
];

const WIDE_FEATURES = [
  {
    icon: "🎯",
    iconClass: styles.featIconTeal,
    title: "For Applicants",
    desc: "Optimize your resume before you submit. Know exactly how you rank and what to fix to stand out from the stack.",
  },
  {
    icon: "🔍",
    iconClass: styles.featIconViolet,
    title: "For Recruiters",
    desc: "Surface keyword gaps instantly and get AI-generated screening questions targeting exactly what the resume doesn't show.",
  },
];

const STATS = [
  { num: "~5s", label: "Analysis time" },
  { num: "3", label: "NLP layers" },
  { num: "18", label: "Skills per scan" },
  { num: "2", label: "Modes" },
];

const PLANS = [
  {
    tier: "Free",
    price: "$0",
    period: "forever",
    badge: null,
    featured: false,
    features: [
      { text: "5 analyses per month", dim: false },
      { text: "Match score + skill tags", dim: false },
      { text: "Basic suggestions", dim: false },
      { text: "Category breakdown", dim: true },
      { text: "Recruiter questions", dim: true },
    ],
    cta: "Get started",
  },
  {
    tier: "Pro",
    price: "$12",
    period: "per month",
    badge: "Most Popular",
    featured: true,
    features: [
      { text: "Unlimited analyses", dim: false },
      { text: "Full match breakdown", dim: false },
      { text: "AI improvement suggestions", dim: false },
      { text: "Category score bars", dim: false },
      { text: "Resume export ready", dim: false },
    ],
    cta: "Start Pro →",
  },
  {
    tier: "Teams",
    price: "$49",
    period: "per seat / month",
    badge: null,
    featured: false,
    features: [
      { text: "Everything in Pro", dim: false },
      { text: "Recruiter screening questions", dim: false },
      { text: "Bulk resume upload", dim: false },
      { text: "ATS integration", dim: false },
      { text: "Priority support", dim: false },
    ],
    cta: "Contact sales",
  },
];

export default function Home() {
  return (
    <main className="page-content">
      {/* ── HERO ── */}
      <section className={styles.hero}>
        {/* Full background image */}
        <div className={styles.heroImageWrap}>
          <img
            src="/img/hero.jpg"
            alt="Resume intelligence"
            className={styles.heroImage}
          />
        </div>

        {/* Content — top and bottom anchored */}
        <div className={styles.heroLeft}>
          {/* Anchors to top */}
          <div className={styles.heroTop}>
            <p className={`eyebrow ${styles.heroEyebrow}`}>
              AI-powered · instant · precise
            </p>
            <h1 className={styles.heroTitle}>
              Resume intelligence{" "}
              <span className="chrome-text-animated">built for the future</span>
            </h1>
          </div>

          {/* Anchors to bottom */}
          <div className={styles.heroBottom}>
            <p className={styles.heroSubtitle}>
              Whether you&apos;re applying or hiring, RankIQ turns resume-to-job
              matching into a science.
            </p>
            <div className={`btn-grad-wrap ${styles.heroCtaBtn}`}>
              <Link
                href="/match"
                className={`btn-grad-inner ${styles.heroCtaLink}`}
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsStrip}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCell}>
              <span className={`chrome-text-animated ${styles.statNum}`}>
                {s.num}
              </span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.featuresSection}>
        <p className="section-label">What RankIQ does</p>

        <div className={styles.featGrid}>
          {FEATURES.map((f) => (
            <div className="glass-wrap" key={f.title}>
              <div className={`glass-card ${styles.featCard}`}>
                <div className={`${styles.featIcon} ${f.iconClass}`}>
                  {f.icon}
                </div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.featWideGrid}>
          {WIDE_FEATURES.map((f) => (
            <div className="glass-wrap" key={f.title}>
              <div className={`glass-card ${styles.featWideCard}`}>
                <div className={`${styles.featWideIcon} ${f.iconClass}`}>
                  {f.icon}
                </div>
                <div className={styles.featWideBody}>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className={styles.pricingSection}>
        <p className="section-label">Simple pricing</p>
        <div className={styles.pricingGrid}>
          {PLANS.map((p) => (
            <div className="glass-wrap" key={p.tier}>
              <div className={`glass-card ${styles.priceCard}`}>
                {p.badge && (
                  <span className={`badge badge-green ${styles.priceBadge}`}>
                    {p.badge}
                  </span>
                )}
                <span className={styles.priceTier}>{p.tier}</span>
                <span
                  className={`${styles.priceVal} ${p.featured ? "chrome-text-animated" : ""}`}
                >
                  {p.price}
                </span>
                <span className={styles.pricePeriod}>{p.period}</span>
                <div className={styles.priceDivider} />
                <ul className={styles.priceFeatures}>
                  {p.features.map((f) => (
                    <li
                      key={f.text}
                      className={`${styles.priceFeatureItem} ${f.dim ? styles.dim : ""}`}
                    >
                      <span
                        className={`${styles.priceCheck} ${f.dim ? styles.dim : ""}`}
                      >
                        ✓
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                {p.featured ? (
                  <div className={`btn-grad-wrap ${styles.priceCtaFeatured}`}>
                    <button className="btn-grad-inner">{p.cta}</button>
                  </div>
                ) : (
                  <button className={styles.priceCtaDefault}>{p.cta}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
