import Link from "next/link";
import styles from "./layout.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        Rank<span className="chrome-text-animated">IQ</span>
      </Link>
    </header>
  );
}
