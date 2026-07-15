import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiExternalLink, FiCalendar, FiClock, FiArrowRight, FiFileText } from "react-icons/fi";
import PageShell from "../components/PageShell";
import { getExamsByBoard } from "../services/examService";
import styles from "./ExamBoardPage.module.css";

const BOARD_META = {
  SSC: {
    name: "Staff Selection Commission",
    color: "#1e40af",
    bg: "linear-gradient(135deg, #0F4C81, #1a5f9a)",
    officialUrl: "https://ssc.gov.in/home/notice-board",
  },
  UPSC: {
    name: "Union Public Service Commission",
    color: "#dc2626",
    bg: "linear-gradient(135deg, #7c2d12, #dc2626)",
    officialUrl: "https://upsc.gov.in",
  },
  RRB: {
    name: "Railway Recruitment Board",
    color: "#059669",
    bg: "linear-gradient(135deg, #064e3b, #059669)",
    officialUrl: "https://indianrailways.gov.in",
  },
  IBPS: {
    name: "Institute of Banking Personnel Selection",
    color: "#7c3aed",
    bg: "linear-gradient(135deg, #4c1d95, #7c3aed)",
    officialUrl: "https://www.ibps.in",
  },
};

const ExamBoardPage = () => {
  const { board } = useParams();
  const navigate = useNavigate();
  const boardCode = (board || "").toUpperCase();
  const meta = BOARD_META[boardCode] || {
    name: boardCode,
    color: "#0F4C81",
    bg: "linear-gradient(135deg, #0F4C81, #1a5f9a)",
    officialUrl: "#",
  };

  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadExams = useCallback(async (pg = 1, cat = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getExamsByBoard(boardCode, pg, 20, cat);
      setExams(res.exams || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
      setPage(pg);

      if (!cat && pg === 1) {
        const cats = [...new Set((res.exams || []).map((e) => e.category).filter(Boolean))];
        setCategories(cats);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [boardCode]);

  useEffect(() => {
    setPage(1);
    setActiveCategory(null);
    setExams([]);
    loadExams(1, null);
  }, [boardCode, loadExams]);

  const handleCategoryFilter = (cat) => {
    const next = activeCategory === cat ? null : cat;
    setActiveCategory(next);
    loadExams(1, next);
  };

  const handlePageChange = (newPage) => {
    loadExams(newPage, activeCategory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "tween", duration: 0.3 } }
  };

  return (
    <PageShell
      title={`${boardCode} Notifications`}
      subtitle={`Latest official notifications from ${meta.name}.`}
      actions={
        <button
          type="button"
          className="btnOutline"
          onClick={() => navigate("/dashboard")}
          style={{ background: 'var(--color-bg)' }}
        >
          ← Back to Dashboard
        </button>
      }
    >
      <div className={styles.pageContainer}>
        {/* Board hero banner */}
        <div className={styles.heroBanner} style={{ background: meta.bg }}>
          <div className={styles.heroLeft}>
            <div>
              <h2 className={styles.heroTitle}>{boardCode}</h2>
              <p className={styles.heroSubtitle}>{meta.name}</p>
            </div>
          </div>
          <div className={styles.heroRight}>
            <a
              href={meta.officialUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.btnOfficial}
            >
              Official Portal <FiExternalLink />
            </a>
          </div>
        </div>

        {/* Category filter chips */}
        {categories.length > 1 && (
          <div className={styles.filterSection}>
            <span className={styles.filterLabel}>Filter by Category:</span>
            <div className={styles.filterChips}>
              <button
                className={`${styles.chip} ${!activeCategory ? styles.chipActive : ""}`}
                onClick={() => handleCategoryFilter(null)}
                type="button"
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ""}`}
                  onClick={() => handleCategoryFilter(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notification list */}
        {loading ? (
          <div className={styles.notificationList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.notificationCard} style={{ minHeight: '120px', opacity: 0.7 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: '16px', width: '150px', background: '#E2E8F0', marginBottom: '12px', borderRadius: '4px' }}></div>
                  <div style={{ height: '24px', width: '70%', background: '#E2E8F0', borderRadius: '4px' }}></div>
                </div>
                <div style={{ height: '40px', width: '100px', background: '#E2E8F0', borderRadius: '8px' }}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <p style={{ color: 'var(--color-error)' }}>{error}</p>
            <button className="btnPrimary" onClick={() => loadExams(page, activeCategory)} style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : exams.length === 0 ? (
          <div className={styles.emptyState}>
            <FiFileText />
            <h3>No notifications found</h3>
            <p>
              {activeCategory
                ? `No notifications in the "${activeCategory}" category. Try removing the filter.`
                : "No data has been scraped yet. The scraper will populate this on the next run."}
            </p>
            {activeCategory && (
              <button
                className="btnOutline"
                onClick={() => handleCategoryFilter(null)}
                style={{ marginTop: '1rem' }}
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.listHeader}>
              <span className={styles.listCount}>
                Showing page {page} of {pages} ({total} notifications)
              </span>
            </div>

            <motion.div 
              className={styles.notificationList}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {exams.map((exam) => (
                <motion.div key={exam.id} variants={itemVariants} className={styles.notificationCard}>
                  <div className={styles.notificationContent}>
                    <div className={styles.metaRow}>
                      {exam.notification_date && (
                        <span className={styles.dateBadge}>
                          <FiCalendar /> {formatDate(exam.notification_date)}
                        </span>
                      )}
                      {exam.apply_end_date && (
                        <span className={styles.deadlineBadge}>
                          <FiClock /> Apply by: {formatDate(exam.apply_end_date)}
                        </span>
                      )}
                    </div>
                    <h3 className={styles.notificationTitle}>{exam.title}</h3>
                  </div>

                  <div className={styles.notificationActions}>
                    <Link
                      to={`/exams/${exam.id}`}
                      className={styles.actionBtn}
                    >
                      View Details <FiArrowRight />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  ← Prev
                </button>
                <div className={styles.pageNums}>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    let pg;
                    if (pages <= 7) {
                      pg = i + 1;
                    } else if (page <= 4) {
                      pg = i + 1;
                    } else if (page >= pages - 3) {
                      pg = pages - 6 + i;
                    } else {
                      pg = page - 3 + i;
                    }
                    return (
                      <button
                        key={pg}
                        className={`${styles.pageNum} ${pg === page ? styles.pageNumActive : ""}`}
                        onClick={() => handlePageChange(pg)}
                      >
                        {pg}
                      </button>
                    );
                  })}
                </div>
                <button
                  className={styles.pageBtn}
                  disabled={page >= pages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
};

export default ExamBoardPage;
