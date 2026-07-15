import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { resetPassword } from "../services/authService";
import styles from "./Auth.module.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const id = searchParams.get("id") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !id) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await resetPassword({ id, token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.authPage}>
      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <Link to="/" className={styles.brand}>GovExam <span>Connect</span></Link>
          <h1 className={styles.heading}>Reset Password</h1>
          <p className={styles.subtle}>Enter a new password for your account.</p>
        </div>

        {done ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.success} style={{ justifyContent: 'center', marginBottom: '1.5rem', padding: '1rem' }}>
              <FiCheckCircle size={20} />
              <span>Password updated successfully!</span>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              You can now sign in with your new password.
            </p>
            <Link to="/login" className={styles.btnPrimary} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Proceed to Sign In
            </Link>
          </motion.div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>New Password</label>
              <div className={styles.inputWrapper}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {token && <input type="hidden" value={token} />}
            
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.error}>
                <FiAlertCircle />
                <span>{error}</span>
              </motion.div>
            )}

            <button type="submit" className={styles.btnPrimary} style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
};

export default ResetPassword;
