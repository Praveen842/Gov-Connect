import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiUser, FiSettings, FiMail, FiPhone, FiBell, FiCheckCircle, FiAlertCircle, FiSave } from "react-icons/fi";
import PageShell from "../components/PageShell";
import { getProfile, updateProfile } from "../services/profileService";
import styles from "./Profile.module.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    preferences: "",
    notificationsEnabled: true
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        if (isMounted) {
          setProfile(response.candidate);
          setFormData({
            fullName: response.candidate.fullName || "",
            phone: response.candidate.phone || "",
            preferences: response.candidate.preferences || "",
            notificationsEnabled: response.candidate.notificationsEnabled ?? true
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await updateProfile(formData);
      setProfile(response.candidate);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: error.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="" subtitle="" compact={false}>
      <div className={styles.pageContainer}>
        <div style={{ marginBottom: '16px' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
            &larr; Back to Dashboard
          </Link>
        </div>
        <div className={styles.header}>
          <h1>Candidate Profile</h1>
          <p>Manage your personal details and exam preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.grid}>
          {/* PERSONAL INFO CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <FiUser className={styles.cardIcon} />
              <h3>Personal Information</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                {loading ? <div className={styles.skeletonField} /> : (
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className={styles.input} 
                    required 
                  />
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                  {loading ? <div className={styles.skeletonField} /> : (
                    <input 
                      type="email" 
                      value={profile?.email || ""} 
                      className={styles.input} 
                      style={{ width: '100%', paddingLeft: 40 }}
                      disabled 
                    />
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Email cannot be changed.</span>
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <FiPhone style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                  {loading ? <div className={styles.skeletonField} /> : (
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className={styles.input} 
                      placeholder="e.g. +91 9876543210"
                      style={{ width: '100%', paddingLeft: 40 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* PREFERENCES CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <FiSettings className={styles.cardIcon} />
              <h3>Preferences</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.toggleContainer}>
                <div className={styles.toggleInfo}>
                  <h4><FiBell style={{ color: '#f59e0b', marginRight: 4 }} /> Notification Alerts</h4>
                  <p>Receive email updates for new exams.</p>
                </div>
                <label className={styles.toggleSwitch}>
                  {loading ? <div /> : (
                    <input 
                      type="checkbox" 
                      name="notificationsEnabled" 
                      checked={formData.notificationsEnabled} 
                      onChange={handleChange} 
                    />
                  )}
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label>Exam Preparation Preferences</label>
                {loading ? <div className={styles.skeletonField} style={{ height: 100 }} /> : (
                  <textarea 
                    name="preferences" 
                    value={formData.preferences} 
                    onChange={handleChange} 
                    className={`${styles.input} ${styles.textarea}`} 
                    placeholder="e.g., Interested in UPSC Civil Services, SSC CGL..."
                  />
                )}
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>This helps us recommend the right exams for you.</span>
              </div>
            </div>
            <div className={styles.cardFooter}>
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                  {message.text}
                </div>
              )}
              <button type="submit" className={styles.btnPrimary} disabled={loading || saving}>
                {saving ? "Saving..." : <><FiSave /> Save Changes</>}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </PageShell>
  );
};

export default Profile;
