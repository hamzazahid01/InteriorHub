import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../../utils/auth";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Close drawer when navigating
    setMobileOpen(false);
  }, [location.pathname]);

  function logout() {
    clearToken();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className={styles.shell}>
      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}

      <aside className={mobileOpen ? `${styles.sidebar} ${styles.sidebarOpen}` : styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>InteriorHub</div>
          <div className={styles.brandSub}>Admin</div>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Categories
          </NavLink>
          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Inquiries
          </NavLink>
        </nav>
      </aside>

      <section className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.topbarInner}>
            <div className={styles.topbarLeft}>
              <button
                className={styles.menuBtn}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle admin menu"
                type="button"
              >
                ☰
              </button>
              <div className={styles.topbarTitle}>Admin Panel</div>
            </div>
            <button className={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </section>
    </div>
  );
}

