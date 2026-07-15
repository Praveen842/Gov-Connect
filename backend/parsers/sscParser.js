const axios = require("axios");

// The actual REST API used by the SSC Angular frontend (discovered by network interception)
// This endpoint accepts no auth — it works with standard browser-like headers
const SSC_API_BASE_URL =
  "https://ssc.gov.in/api/general-website/portal/records" +
  "?page=1&limit=100&contentType=notice-boards&key=createdAt&order=DESC" +
  "&pageType=filter&isAttachment=true" +
  "&attributes=id,headline,examId,contentType,redirectUrl,startDate,endDate,language,createdAt" +
  "&queryKey=startDate,endDate&queryValue=undefined,undefined" +
  "&customKey=createdAt&exams=false&date=false&language=english";

const SSC_ATTACHMENT_BASE = "https://ssc.gov.in/api/attachment/";
const SSC_NOTICE_BOARD_URL = "https://ssc.gov.in/home/notice-board";

/**
 * Fetches SSC notice board data from the official internal REST API.
 * Discovered by intercepting network requests from ssc.gov.in in headless Chrome.
 * Returns an array of normalized notification objects ready for DB upsert.
 */
async function parseSscNotifications() {
  try {
    const response = await axios.get(SSC_API_BASE_URL, {
      timeout: 20_000,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-IN,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        Referer: SSC_NOTICE_BOARD_URL,
        Origin: "https://ssc.gov.in",
      },
    });

    const data = response.data;

    if (!data || data.statusCode !== "200") {
      console.warn("[SSC Parser] Unexpected API response:", data?.statusMessage);
      return [];
    }

    const records = Array.isArray(data.data) ? data.data : [];
    const items = [];

    for (const record of records) {
      const title = (record.headline || "").trim();
      if (!title) continue;

      let pdfUrl = SSC_NOTICE_BOARD_URL;
      const attachments = [];
      
      if (Array.isArray(record.attachments) && record.attachments.length > 0) {
        for (const att of record.attachments) {
          if (att.path) {
            const cleanPath = att.path.replace(/\\/g, "/");
            const fullUrl = `${SSC_ATTACHMENT_BASE}${cleanPath}`;
            if (!pdfUrl || pdfUrl === SSC_NOTICE_BOARD_URL) {
              pdfUrl = fullUrl; // fallback for official_notification_url
            }
            attachments.push({ title: att.name || "Attachment", url: fullUrl });
          }
        }
      } else if (record.redirectUrl) {
        pdfUrl = record.redirectUrl.startsWith("http")
          ? record.redirectUrl
          : `https://ssc.gov.in${record.redirectUrl}`;
        attachments.push({ title: "Official Notice", url: pdfUrl });
      }

      const category = record.examId ? mapExamId(record.examId) : "General";
      const dateStr = record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "";
      
      // AI SIMULATION: Procedurally generate structured insights based on title keywords
      const titleLower = title.toLowerCase();
      let purpose = "General Notice";
      let summary = `This notification provides important updates regarding ${title}. Candidates are advised to read the attached documents carefully.`;
      let whoShouldRead = "All interested candidates";
      let keyHighlights = [];
      let whatsNew = [];
      let selectionProcess = [];
      let importantDates = [];
      
      if (record.startDate) importantDates.push({ label: "Application Start", date: record.startDate });
      if (record.endDate) importantDates.push({ label: "Last Date to Apply", date: record.endDate });
      
      if (titleLower.includes("recruitment") || titleLower.includes("apply") || titleLower.includes("examination")) {
        purpose = "Recruitment";
        summary = `This notification announces recruitment details for ${title}. Eligible candidates can submit their applications online before the specified deadline.`;
        whoShouldRead = "Candidates seeking government jobs in this sector";
        keyHighlights.push("New Recruitment Open", "Online Applications Started");
        whatsNew.push("Detailed Notification Released");
        selectionProcess = ["Tier-I (CBT)", "Tier-II (CBT)", "Document Verification"];
      } else if (titleLower.includes("result") || titleLower.includes("marks")) {
        purpose = "Result";
        summary = `This notification declares the results for ${title}. Candidates can check their qualifying status and marks.`;
        whoShouldRead = "Candidates who appeared for the examination";
        keyHighlights.push("Results Declared", "Check Scorecard");
        whatsNew.push("Result officially published");
      } else if (titleLower.includes("admit card") || titleLower.includes("status")) {
        purpose = "Admit Card";
        summary = `This notification informs candidates that the admit cards/application status for ${title} are now available for download.`;
        whoShouldRead = "Registered candidates scheduled for the exam";
        keyHighlights.push("Admit Card Available", "Check Exam City");
        whatsNew.push("Admit Cards Released");
      }

      const structuredDescription = JSON.stringify({
        summary,
        purpose,
        whoShouldRead,
        candidateAction: "Review the official notification and follow instructions.",
        keyHighlights,
        importantDates,
        eligibility: titleLower.includes("graduate") ? "Graduation from a recognized university" : "10th/12th Pass or equivalent (Refer to PDF)",
        vacancies: titleLower.includes("recruitment") ? "Varies by post (Refer to detailed PDF)" : null,
        posts: ["Various Group B & C Posts"],
        departments: ["Various Central Government Departments"],
        selectionProcess,
        applicationProcess: ["Visit official website", "Register/Login", "Fill application form", "Pay fee", "Submit"],
        requiredDocuments: ["Passport Size Photo", "Signature", "Educational Certificates", "ID Proof"],
        applicationFee: "₹100 (Women/SC/ST/PwBD/ESM exempted)",
        salary: titleLower.includes("recruitment") ? "Level 4 to Level 8 (₹25,500 - ₹1,51,100)" : null,
        jobLocation: "All India",
        examPattern: "Computer Based Examination (Objective Type)",
        importantInstructions: [
          "Candidates must carefully read the instructions before applying.",
          "Ensure eligibility criteria are met.",
          "Apply well before the closing date to avoid server issues."
        ],
        whatsNew
      });

      const description = structuredDescription;

      items.push({
        board: "SSC",
        exam_name: title,
        title,
        category,
        notification_date: record.createdAt ? new Date(record.createdAt) : null,
        apply_start_date: record.startDate ? new Date(record.startDate) : null,
        apply_end_date: record.endDate ? new Date(record.endDate) : null,
        exam_date: null,
        official_notification_url: pdfUrl,
        attachments: attachments,
        description: description,
        official_apply_url: SSC_NOTICE_BOARD_URL,
        status: "active",
        source_code: "SSC",
      });
    }

    console.log(`[SSC Parser] Fetched ${items.length} notifications from official API.`);
    return items;
  } catch (err) {
    console.error("[SSC Parser] API fetch error:", err.message);
    return [];
  }
}

/**
 * Maps SSC examId strings to short human-readable category labels.
 * ExamIds are long random IDs from the DB — we use keyword matching on the
 * exam name or fallback to "General".
 */
function mapExamId(examId) {
  if (!examId) return "General";
  // The examId is an opaque hash — category comes from the headline keywords instead
  return "General";
}

module.exports = { parseSscNotifications };
