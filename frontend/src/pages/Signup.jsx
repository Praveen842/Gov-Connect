import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser } from "react-icons/fi";
import styles from "./Auth.module.css";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
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
          <h1 className={styles.heading}>Create Account</h1>
          <p className={styles.subtle}>Join now to start tracking your government exams.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <FiUser className={styles.inputIcon} />
              <input
                name="fullName"
                type="text"
                placeholder="John Doe"
                className={styles.input}
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className={styles.input}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className={styles.input}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.error}>
              <FiAlertCircle />
              <span>{error}</span>
            </motion.div>
          )}

          <button type="submit" className={styles.btnPrimary} disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default Signup;
