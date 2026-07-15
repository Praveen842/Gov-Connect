const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");

const RRB_BASE_URL = "https://indianrailways.gov.in/railwayboard";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function parseRrbNotifications(url) {
  // Override URL to target the unified RRB Apply API instead of scraping HTML
  const apiUrl = "https://api.recruitmentrrb.in/api/Advertisement/WhatsNew";
  const items = [];
  try {
    const response = await axios.get(apiUrl, {
      httpsAgent,
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Referer": "https://www.rrbapply.gov.in/",
        "Origin": "https://www.rrbapply.gov.in"
      }
    });

    if (response.data && response.data.result && Array.isArray(response.data.result)) {
      for (const notice of response.data.result) {
        if (!notice.description) continue;
        
        let pdfUrl = notice.documentUrl;
        if (pdfUrl && !pdfUrl.startsWith("http")) {
          pdfUrl = `https://www.rrbapply.gov.in${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
        }
        
        const applyUrl = notice.link ? notice.link : "https://www.rrbapply.gov.in/#/auth/landing";
        
        items.push({
          board: "RRB",
          exam_name: notice.description.substring(0, 250),
          title: notice.description.substring(0, 250),
          category: "notification",
          notification_date: new Date(notice.publishDate || notice.startDate || new Date()),
          official_notification_url: pdfUrl || null,
          official_apply_url: applyUrl,
          source_code: "RRB"
        });
      }
    }

    // Remove duplicates based on title just in case the API returns duplicates
    const uniqueItems = [];
    const seenTitles = new Set();
    for (const item of items) {
      if (!seenTitles.has(item.title)) {
        seenTitles.add(item.title);
        uniqueItems.push(item);
      }
    }

    return uniqueItems.slice(0, 100);
  } catch (error) {
    console.error("RRB Scraper Error:", error.message);
  }

  return items;
}

module.exports = { parseRrbNotifications };
