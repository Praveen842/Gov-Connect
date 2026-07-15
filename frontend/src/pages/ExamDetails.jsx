import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiFileText, FiExternalLink, FiChevronLeft, FiAlertCircle, 
  FiCalendar, FiInfo, FiCheckCircle, FiDownload, FiShare2, FiBookmark, FiLink,
  FiBriefcase, FiDollarSign, FiMapPin, FiAward, FiArrowDown
} from "react-icons/fi";
import PageShell from "../components/PageShell";
import { getExamById } from "../services/examService";
import styles from "./ExamDetails.module.css";

// --- SUB-COMPONENTS ---

const Breadcrumb = ({ board }) => (
  <div className={styles.breadcrumb}>
    <Link to="/">Home</Link>
    <span>/</span>
    <Link to={`/exams/board/${board}`}>{board} Notifications</Link>
    <span>/</span>
    <span style={{ color: '#0f172a' }}>Notification Details</span>
  </div>
);

const NotificationHeader = ({ exam }) => (
  <div className={styles.heroCard} style={{ marginBottom: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <div className={styles.badgeRow} style={{ marginBottom: '12px' }}>
          <span className={styles.badge} style={{ background: '#e0e7ff', color: '#3730a3' }}>{exam.board}</span>
          <span className={styles.badge}>{exam.category || 'General'}</span>
          <span className={styles.badge} style={{ background: exam.status === 'active' ? '#dcfce7' : '#f1f5f9', color: exam.status === 'active' ? '#166534' : '#334155' }}>
            {exam.status === 'active' ? 'Open' : 'Closed'}
          </span>
        </div>
        <h1 className={styles.heroTitle} style={{ margin: 0 }}>{exam.title}</h1>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '24px', marginTop: '20px', fontSize: '0.875rem', color: '#64748b' }}>
      {exam.notification_date && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiCalendar /> Published: {new Date(exam.notification_date).toLocaleDateString()}
        </span>
      )}
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FiCheckCircle /> Source: Official Website
      </span>
    </div>
  </div>
);

// SECTION 1: AI Summary
const SummaryCard = ({ summary }) => {
  if (!summary) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.card} style={{ marginBottom: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <div className={styles.cardHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <FiInfo className={styles.cardIcon} style={{ color: '#0ea5e9' }} />
        <h3>What This Notification Says</h3>
      </div>
      <div className={styles.cardBody} style={{ marginTop: '12px', fontSize: '1.05rem', color: '#334155' }}>
        {summary}
      </div>
    </motion.div>
  );
};

// SECTION 2: Key Highlights
const HighlightsCard = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;
  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        <FiAward className={styles.cardIcon} style={{ color: '#f59e0b' }} />
        <h3>Key Highlights</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.badgeRow}>
          {highlights.map((h, i) => (
            <span key={i} className={styles.badge} style={{ background: '#fef3c7', color: '#b45309', fontWeight: 500 }}>
              <FiCheckCircle /> {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// SECTION WHAT'S NEW
const WhatsNewCard = ({ whatsNew }) => {
  if (!whatsNew || whatsNew.length === 0) return null;
  return (
    <div className={styles.card} style={{ marginBottom: '24px', borderLeft: '4px solid #10b981' }}>
      <div className={styles.cardHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
          What's New
        </h3>
      </div>
      <div className={styles.cardBody} style={{ marginTop: '12px' }}>
        <ul className={styles.bulletList}>
          {whatsNew.map((news, i) => (
            <li key={i}><FiCheckCircle style={{ color: '#10b981' }} /> {news}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// SECTION 3: Important Information Grid
const ImportantInfoCard = ({ aiData }) => {
  const fields = [];
  if (aiData.purpose) fields.push({ label: 'Purpose', value: aiData.purpose });
  if (aiData.whoShouldRead) fields.push({ label: 'Target Audience', value: aiData.whoShouldRead });
  if (aiData.posts && aiData.posts.length > 0) fields.push({ label: 'Posts', value: aiData.posts.join(", ") });
  if (aiData.departments && aiData.departments.length > 0) fields.push({ label: 'Departments', value: aiData.departments.join(", ") });
  if (aiData.salary) fields.push({ label: 'Salary', value: aiData.salary });
  if (aiData.jobLocation) fields.push({ label: 'Job Location', value: aiData.jobLocation });
  if (aiData.examPattern) fields.push({ label: 'Exam Mode', value: aiData.examPattern });

  if (fields.length === 0) return null;

  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        <FiBriefcase className={styles.cardIcon} />
        <h3>Important Information</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoGrid}>
          {fields.map((f, i) => (
            <div key={i} className={styles.infoItem}>
              <div className={styles.infoLabel}>{f.label}</div>
              <div className={styles.infoValue}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SECTION 4: Important Dates Timeline
const ImportantDatesCard = ({ dates }) => {
  if (!dates || dates.length === 0) return null;

  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        <FiCalendar className={styles.cardIcon} />
        <h3>Important Dates</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.timeline}>
          {dates.map((item, idx) => (
            <div key={idx} className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${idx === dates.length - 1 ? styles.timelineIconActive : ''}`}>
                <FiCheckCircle />
              </div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineLabel}>{item.label}</p>
                <p className={styles.timelineDate}>
                  {new Date(item.date).toLocaleDateString() === 'Invalid Date' ? item.date : new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SECTION 5 & 6: Eligibility & Vacancies
const StandardTextCard = ({ title, content, icon }) => {
  if (!content) return null;
  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        {icon}
        <h3>{title}</h3>
      </div>
      <div className={styles.cardBody}>
        <p>{content}</p>
      </div>
    </div>
  );
};

// SECTION 7: Selection Process
const SelectionProcessCard = ({ steps }) => {
  if (!steps || steps.length === 0) return null;
  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        <FiCheckCircle className={styles.cardIcon} />
        <h3>Selection Process</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.flowchart}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className={styles.flowStep}>
                <div className={styles.flowStepNumber}>{i + 1}</div>
                <div style={{ fontWeight: 500, color: '#0f172a' }}>{step}</div>
              </div>
              {i < steps.length - 1 && (
                <div className={styles.flowStepArrow}>
                  <FiArrowDown size={20} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// SECTION 8 & 9: Application Process & Required Documents
const BulletListCard = ({ title, items, icon }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        {icon}
        <h3>{title}</h3>
      </div>
      <div className={styles.cardBody}>
        <ul className={styles.bulletList}>
          {items.map((item, i) => (
            <li key={i}><FiCheckCircle /> {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// SECTION 14: Official Documents
const OfficialDocumentsCard = ({ exam }) => {
  const docs = [];
  if (exam.attachments && exam.attachments.length > 0) {
    exam.attachments.forEach(att => docs.push(att));
  } else if (exam.official_notification_url) {
    docs.push({ title: 'Official Notification PDF', url: exam.official_notification_url });
  }

  if (docs.length === 0) return null;

  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        <FiFileText className={styles.cardIcon} style={{ color: '#ef4444' }} />
        <h3>Official Documents</h3>
      </div>
      <div className={styles.cardBody}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {docs.map((doc, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiFileText size={24} color="#ef4444" />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{doc.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Published by {exam.board}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={doc.url} target="_blank" rel="noreferrer" className={styles.btnOutline} style={{ padding: '8px 12px', fontSize: '0.875rem' }}>
                  <FiExternalLink /> View PDF
                </a>
                <a href={doc.url} download target="_blank" rel="noreferrer" className={styles.btnSecondary} style={{ padding: '8px 12px', fontSize: '0.875rem' }}>
                  <FiDownload /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SECTION 15: Official Links
const OfficialLinksCard = ({ exam }) => {
  const links = [];
  if (exam.official_apply_url) links.push({ label: 'Apply Online / Official Website', url: exam.official_apply_url, type: 'primary' });

  if (links.length === 0) return null;

  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      <div className={styles.cardHeader}>
        <FiLink className={styles.cardIcon} />
        <h3>Official Links</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.linksGrid}>
          {links.map((link, idx) => (
            <a key={idx} href={link.url} target="_blank" rel="noreferrer" className={link.type === 'primary' ? styles.btnPrimary : styles.btnSecondary}>
              {link.label} <FiExternalLink />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};



const DynamicSectionRenderer = ({ exam }) => {
  // ATTEMPT TO PARSE AI JSON
  let aiData = null;
  let legacyText = null;

  if (exam.description) {
    try {
      aiData = JSON.parse(exam.description);
    } catch (e) {
      legacyText = exam.description; // Fallback to raw text
    }
  }

  // Use DB dates as fallback if AI dates missing
  const fallbackDates = [];
  if (exam.apply_start_date) fallbackDates.push({ label: 'Application Start', date: exam.apply_start_date });
  if (exam.apply_end_date) fallbackDates.push({ label: 'Last Date to Apply', date: exam.apply_end_date });
  if (exam.exam_date) fallbackDates.push({ label: 'Exam Date', date: exam.exam_date });

  if (aiData) {
    return (
      <>
        <WhatsNewCard whatsNew={aiData.whatsNew} />
        <SummaryCard summary={aiData.summary} />
        <HighlightsCard highlights={aiData.keyHighlights} />
        <ImportantInfoCard aiData={aiData} />
        <ImportantDatesCard dates={aiData.importantDates && aiData.importantDates.length > 0 ? aiData.importantDates : fallbackDates} />
        <StandardTextCard title="Who Can Apply" content={aiData.eligibility} icon={<FiCheckCircle className={styles.cardIcon} />} />
        <StandardTextCard title="Vacancy Details" content={aiData.vacancies} icon={<FiBriefcase className={styles.cardIcon} />} />
        <StandardTextCard title="Application Fee" content={aiData.applicationFee} icon={<FiDollarSign className={styles.cardIcon} />} />
        <SelectionProcessCard steps={aiData.selectionProcess} />
        <BulletListCard title="Application Process" items={aiData.applicationProcess} icon={<FiExternalLink className={styles.cardIcon} />} />
        <BulletListCard title="Required Documents" items={aiData.requiredDocuments} icon={<FiFileText className={styles.cardIcon} />} />
        <BulletListCard title="Important Instructions" items={aiData.importantInstructions} icon={<FiInfo className={styles.cardIcon} style={{ color: '#f59e0b' }} />} />
        <OfficialDocumentsCard exam={exam} />
        <OfficialLinksCard exam={exam} />

      </>
    );
  }

  // LEGACY FALLBACK RENDERER
  return (
    <>
      {legacyText && <StandardTextCard title="Eligibility & Info" content={legacyText} icon={<FiInfo className={styles.cardIcon} />} />}
      <ImportantDatesCard dates={fallbackDates} />
      <OfficialDocumentsCard exam={exam} />
      <OfficialLinksCard exam={exam} />
    </>
  );
};

const StickySidebar = ({ exam }) => (
  <div className={styles.stickySidebar}>
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a' }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className={styles.btnOutline} style={{ width: '100%', justifyContent: 'center' }} onClick={() => alert('Share feature coming soon!')}>
            <FiShare2 /> Share Notification
          </button>
          <button className={styles.btnOutline} style={{ width: '100%', justifyContent: 'center' }} onClick={() => alert('Bookmark feature coming soon!')}>
            <FiBookmark /> Bookmark
          </button>
          <button className={styles.btnOutline} style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}>
            <FiLink /> Copy Link
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const ExamDetails = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadExam = async () => {
      setLoading(true);
      try {
        const response = await getExamById(id);
        if (isMounted) {
          setExam(response.exam || null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load exam:", error);
          setExam(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadExam();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Loading..." subtitle="">
        <div className={styles.pageContainer} style={{ textAlign: "center", padding: "4rem" }}>
          <p>Loading notification details...</p>
        </div>
      </PageShell>
    );
  }

  if (!exam) {
    return (
      <PageShell title="Not Found" subtitle="">
        <div className={styles.emptyState}>
          <FiAlertCircle size={48} color="var(--color-text-muted)" style={{ marginBottom: "1rem" }} />
          <h3>Notification Not Found</h3>
          <p>The examination details could not be loaded or may have been removed.</p>
          <Link to="/dashboard" className={styles.btnPrimary} style={{ marginTop: "1rem" }}>Return to Dashboard</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="" subtitle="" compact={false}>
      <div className={styles.pageContainer}>
        <Breadcrumb board={exam.board} />
        <NotificationHeader exam={exam} />
        
        <div className={styles.layoutGrid}>
          <div className={styles.mainContent}>
            <DynamicSectionRenderer exam={exam} />
          </div>
          <StickySidebar exam={exam} />
        </div>
      </div>
    </PageShell>
  );
};

export default ExamDetails;
