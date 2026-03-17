import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import styles from "./AdminInquiriesPage.module.css";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-AE", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        const { data } = await api.get("/api/inquiries");
        if (cancelled) return;
        setInquiries(data);
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
      <h1 className={styles.title}>Inquiries</h1>
      <p className={styles.subTitle}>View customer requests (no auth yet).</p>

      {status === "loading" && <p className={styles.muted}>Loading inquiries…</p>}
      {status === "error" && (
        <p className={styles.muted}>Couldn’t load inquiries. Please try again.</p>
      )}

      <div className={styles.mobileList} aria-label="Inquiries (mobile)">
        {status === "ready" && inquiries.length === 0 && (
          <div className={styles.mobileEmpty}>No inquiries yet.</div>
        )}

        {inquiries.map((inq) => (
          <div key={inq._id} className={styles.mobileCard}>
            <div className={styles.mobileTop}>
              <div>
                <div className={styles.mobileTitle}>{inq.name}</div>
                <div className={styles.mobileSub}>
                  {inq.phone} • {inq.createdAt ? dateFmt.format(new Date(inq.createdAt)) : "—"}
                </div>
              </div>
              <div className={styles.mobileBadge}>
                {inq.productId?.name ? "Product" : "General"}
              </div>
            </div>

            <div className={styles.mobileRow}>
              <div className={styles.mobileLabel}>Product</div>
              <div className={styles.mobileValue}>{inq.productId?.name || "—"}</div>
            </div>

            <div className={styles.mobileRow}>
              <div className={styles.mobileLabel}>Message</div>
              <div className={styles.mobileMessage}>{inq.message ? inq.message : "—"}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Product</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq._id}>
                <td className={styles.customerCell}>{inq.name}</td>
                <td className={styles.phoneCell}>{inq.phone}</td>
                <td className={styles.productCell}>
                  {inq.productId?.name || "—"}
                </td>
                <td className={styles.messageCell}>
                  {inq.message ? inq.message : <span className={styles.smallMuted}>—</span>}
                </td>
                <td className={styles.dateCell}>
                  {inq.createdAt ? dateFmt.format(new Date(inq.createdAt)) : "—"}
                </td>
              </tr>
            ))}

            {status === "ready" && inquiries.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

