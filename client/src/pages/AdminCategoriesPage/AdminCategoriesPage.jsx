import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import styles from "./AdminCategoriesPage.module.css";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setStatus("loading");
      const { data } = await api.get("/api/categories");
      setCategories(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/api/categories", { name: trimmed });
      setName("");
      setSuccess("Category added successfully.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(id) {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;

    try {
      await api.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch {
      window.alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Categories</h1>
          <p className={styles.subTitle}>Create and organize your product categories.</p>
        </div>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={addCategory}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cat-name">
              Category Name
            </label>
            <input
              id="cat-name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Furniture"
              disabled={saving}
            />
          </div>
          <button className="btn btnPrimary" type="submit" disabled={saving}>
            {saving ? "Adding…" : "Add Category"}
          </button>
        </form>

        {error && <div className={styles.errorBox}>{error}</div>}
        {success && <div className={styles.successBox}>{success}</div>}
      </div>

      {status === "loading" && <p className={styles.muted}>Loading categories…</p>}
      {status === "error" && (
        <p className={styles.muted}>Couldn’t load categories. Please try again.</p>
      )}

      <div className={styles.mobileList} aria-label="Categories (mobile)">
        {status === "ready" && categories.length === 0 && (
          <div className={styles.mobileEmpty}>No categories yet. Add your first category above.</div>
        )}

        {categories.map((c) => (
          <div key={c._id} className={styles.mobileCard}>
            <div className={styles.mobileTitle}>{c.name}</div>
            <div className={styles.mobileSub}>{c._id}</div>
            <div className={styles.mobileActions}>
              <button
                className={`${styles.mobileBtn} ${styles.mobileDanger}`}
                onClick={() => removeCategory(c._id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td className={styles.nameCell}>
                  <div className={styles.name}>{c.name}</div>
                  <div className={styles.smallMuted}>{c._id}</div>
                </td>
                <td className={styles.rowActions}>
                  <button
                    className={`${styles.linkBtn} ${styles.danger}`}
                    onClick={() => removeCategory(c._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {status === "ready" && categories.length === 0 && (
              <tr>
                <td colSpan={2} className={styles.empty}>
                  No categories yet. Add your first category above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

