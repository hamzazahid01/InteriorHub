import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import styles from "./AdminDashboardPage.module.css";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInquiries: 0,
    totalFeaturedProducts: 0,
    totalCategories: 0,
  });
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        const { data } = await api.get("/api/admin/analytics");
        if (cancelled) return;
        setStats(data);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subTitle}>A quick overview of your catalog and requests.</p>

      {status === "loading" && (
        <p className={styles.muted}>Loading overview…</p>
      )}
      {status === "error" && (
        <p className={styles.muted}>Couldn’t load stats. Please try again.</p>
      )}

      <div className={styles.grid} aria-label="Admin stats">
        <div className={styles.card}>
          <div className={styles.label}>Total Products</div>
          <div className={styles.value}>{stats.totalProducts}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Total Inquiries</div>
          <div className={styles.value}>{stats.totalInquiries}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Featured Products</div>
          <div className={styles.value}>{stats.totalFeaturedProducts}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Categories</div>
          <div className={styles.value}>{stats.totalCategories}</div>
        </div>
      </div>
    </div>
  );
}

