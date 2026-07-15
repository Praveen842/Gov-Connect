import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiUser, FiBell, FiSearch } from "react-icons/fi";
import styles from "./PageShell.module.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
];

const PageShell = ({ title, subtitle, actions, children, compact = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.navbar}>
        <Link to={user ? "/dashboard" : "/"} className={styles.brand}>
          GovExam <span>Connect</span>
        </Link>

        {user && (
          <nav className={styles.navLinks} aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className={styles.navActions}>
          {user ? (
            <>
              <button className={styles.btnIcon} aria-label="Notifications">
                <FiBell />
              </button>
              <Link to="/profile" className={styles.btnIcon} aria-label="Profile">
                <FiUser />
              </Link>
              <button type="button" className={styles.btnOutline} onClick={handleLogout} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <FiLogOut />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.btnOutline}>
                Sign In
              </Link>
              <Link to="/signup" className={styles.btnPrimary}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      <main className={`${styles.mainContent} ${compact ? styles.mainContentCompact : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {(title || subtitle || actions) && (
              <section className={styles.pageHeader}>
                <div>
                  <p className={styles.eyebrow}>Candidate Portal</p>
                  {title && <h1 className={styles.pageTitle}>{title}</h1>}
                  {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
                </div>
                {actions && <div>{actions}</div>}
              </section>
            )}

            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} GovExam Connect. All rights reserved. Not affiliated with any government entity.</p>
      </footer>
    </div>
  );
};

export default PageShell;
