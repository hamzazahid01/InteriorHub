import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { setToken } from "../../utils/auth";
import styles from "./AdminLoginPage.module.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setStatus("loading");
      const { data } = await axios.post("/api/auth/login", {
        email: email.trim(),
        password,
      });
      setToken(data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setStatus("error");
      const code = err?.response?.status;
      if (code === 401) setError("Invalid email or password.");
      else setError("Server error. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>InteriorHub</div>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subTitle}>Sign in to manage products and inquiries.</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@interiorhub.com"
              required
              disabled={status === "loading"}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={status === "loading"}
            />
          </div>

          <button className="btn btnPrimary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

