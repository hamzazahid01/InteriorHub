import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>
          © {new Date().getFullYear()} InteriorHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

