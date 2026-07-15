import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiArrowRight, FiExternalLink, FiSearch } from "react-icons/fi";
import PageShell from "../components/PageShell";
import { getBoards } from "../services/examService";
import { getProfile } from "../services/profileService";
import styles from "./Dashboard.module.css";

// Static config for all known exam boards with branding
const BOARD_CONFIG = {
  SSC: {
    name: "Staff Selection Commission",
    abbr: "SSC",
    description: "CGL, CHSL, Stenographer, JE, CAPF & departmental exams",
    accentColor: "#1e40af",
    badge: "Live",
    officialUrl: "https://ssc.gov.in/home/notice-board",
  },
  UPSC: {
    name: "Union Public Service Commission",
    abbr: "UPSC",
    description: "Civil Services, NDA, CDS, CAPF & combined defence exams",
    accentColor: "#dc2626",
    badge: "Coming Soon",
    officialUrl: "https://upsc.gov.in",
  },
  RRB: {
    name: "Railway Recruitment Board",
    abbr: "RRB",
    description: "NTPC, ALP, Group D, JE & all railway recruitment exams",
    accentColor: "#059669",
    badge: "Coming Soon",
    officialUrl: "https://indianrailways.gov.in",
  },
  IBPS: {
    name: "Institute of Banking Personnel Selection",
    abbr: "IBPS",
    description: "PO, Clerk, SO, RRB Banking exams & specialist officer posts",
    accentColor: "#7c3aed",
    badge: "Coming Soon",
    officialUrl: "https://www.ibps.in",
  },
};

const ALL_BOARDS = ["SSC", "UPSC", "RRB", "IBPS"];

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [boardData, setBoardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // Run both requests, but catch errors individually so one doesn't break the other
        const [profileResult, boardsResult] = await Promise.allSettled([
          getProfile(),
          getBoards(),
        ]);

        if (mounted) {
          if (profileResult.status === "fulfilled") {
            setProfile(profileResult.value.candidate);
          } else {
            console.error("Profile load error:", profileResult.reason);
            // If profile fails (e.g. invalid token format), we can still try to show boards
          }

          if (boardsResult.status === "fulfilled") {
            const map = {};
            (boardsResult.value.boards || []).forEach((b) => {
              map[b.board] = b;
            });
            setBoardData(map);
          } else {
            console.error("Boards load error:", boardsResult.reason);
          }
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "tween", duration: 0.3 }
    }
  };

  const filteredBoards = ALL_BOARDS.filter((code) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const cfg = BOARD_CONFIG[code];
    return (
      cfg.abbr.toLowerCase().includes(query) ||
      cfg.name.toLowerCase().includes(query) ||
      cfg.description.toLowerCase().includes(query)
    );
  });

  return (
    <PageShell>
      <div className={styles.dashboardPage}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {profile?.full_name || "Candidate"}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Here is your overview of active government examination boards.
          </p>
        </section>

        {/* Boards Section */}
        <div className={styles.sectionHeader}>

          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search boards..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.boardGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={`${styles.skLine} ${styles.skTitle}`} />
                <div className={`${styles.skLine} ${styles.skText}`} />
                <div className={`${styles.skLine} ${styles.skTextShort}`} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className={styles.boardGrid}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredBoards.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No boards found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredBoards.map((code) => {
                const cfg = BOARD_CONFIG[code];
                const data = boardData[code];
                const hasData = Boolean(data && parseInt(data.count, 10) > 0);
                const lastScraped = data?.last_scraped
                  ? new Date(data.last_scraped).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null;

                return (
                  <motion.article
                    variants={itemVariants}
                    key={code}
                    className={styles.boardCard}
                    onClick={() => hasData && navigate(`/exams/board/${code}`)}
                    role={hasData ? "button" : "article"}
                    tabIndex={hasData ? 0 : -1}
                    onKeyDown={(e) => e.key === "Enter" && hasData && navigate(`/exams/board/${code}`)}
                    style={{ "--card-accent": cfg.accentColor }}
                  >
                    <div className={styles.boardHeader}>
                      <h3 className={styles.boardAbbr}>{cfg.abbr}</h3>
                      <span className={`${styles.badge} ${hasData ? styles.badgeLive : styles.badgeSoon}`}>
                        {hasData ? "LIVE" : cfg.badge}
                      </span>
                    </div>

                    <div className={styles.boardBody}>
                      <h4 className={styles.boardName}>{cfg.name}</h4>
                      <p className={styles.boardDesc}>{cfg.description}</p>
                    </div>

                    <div className={styles.boardFooter}>
                      {hasData ? (
                        <>
                          <div className={styles.lastUpdated}>
                            {lastScraped && <><FiClock /> {lastScraped}</>}
                          </div>
                          <span className={styles.btnView}>
                            View <FiArrowRight />
                          </span>
                        </>
                      ) : (
                        <>
                          <div className={styles.lastUpdated}>
                            Data unavailable
                          </div>
                          <a
                            href={cfg.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.btnExt}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Official Site <FiExternalLink />
                          </a>
                        </>
                      )}
                    </div>
                  </motion.article>
                );
              })
            )}
          </motion.div>
        )}
      </div>
    </PageShell>
  );
};

export default Dashboard;
