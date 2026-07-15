import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBell, FiCheckCircle, FiClock, FiArrowRight } from "react-icons/fi";
import styles from "./Home.module.css";

const features = [
  {
    title: "Instant Notifications",
    description: "Get immediate alerts for new government exam announcements, syllabus releases, and result publications.",
    icon: <FiBell />
  },
  {
    title: "Candidate Tracking",
    description: "Monitor your application status, manage admit card downloads, and track your overall exam progress seamlessly.",
    icon: <FiCheckCircle />
  },
  {
    title: "Deadline Reminders",
    description: "Never miss an important date. Receive smart reminders for application windows and upcoming exam dates.",
    icon: <FiClock />
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const Home = () => {
  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.heroTitle}>Your Gateway to Government Services</h1>
          <p className={styles.heroSubtitle}>
            The official unified portal for seamless exam notifications, real-time application tracking, and automated deadline management.
          </p>
          <div className={styles.heroActions}>
            <Link to="/signup" className={styles.btnSolid}>
              Get Started <FiArrowRight />
            </Link>
            <Link to="/login" className={styles.btnOutlineWhite}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>Why Choose GovExam Connect?</h2>
          <p>We aggregate official notices from major recruitment boards, ensuring you have reliable data at your fingertips.</p>
        </div>
        
        <motion.div 
          className={styles.featureGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.article key={index} variants={itemVariants} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h4>4+</h4>
            <p>Govt Boards</p>
          </div>
          <div className={styles.statItem}>
            <h4>Real-time</h4>
            <p>Data Synchronization</p>
          </div>
          <div className={styles.statItem}>
            <h4>100%</h4>
            <p>Official Sources</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} GovExam Connect. Designed for Candidates.</p>
      </footer>
    </div>
  );
};

export default Home;
