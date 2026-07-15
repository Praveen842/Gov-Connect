import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { forgotPassword } from "../services/authService";
import styles from "./Auth.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
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
          <h1 className={styles.heading}>Forgot Password</h1>
          <p className={styles.subtle}>Enter your account email and we'll send reset instructions.</p>
        </div>

        {!sent ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.error}>
                <FiAlertCircle />
                <span>{error}</span>
              </motion.div>
            )}

            <button type="submit" className={styles.btnPrimary} style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.success} style={{ justifyContent: 'center', marginBottom: '1.5rem', padding: '1rem' }}>
              <FiCheckCircle size={20} />
              <span>Reset instructions sent!</span>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              If an account exists for <strong>{email}</strong>, you will receive an email shortly.
            </p>
          </motion.div>
        )}

        <p className={styles.footerText}>
          Remember your password?{" "}
          <Link to="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default ForgotPassword;
