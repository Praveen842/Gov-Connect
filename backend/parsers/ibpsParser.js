const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");

const IBPS_BASE_URL = "https://www.ibps.in";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function parseIbpsNotifications(url) {
  // Override URL to specifically target the recruitment page as requested
  const targetUrl = "https://www.ibps.in/index.php/recruitment/";
  const items = [];
  try {
    const response = await axios.get(targetUrl, {
      httpsAgent,
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const $ = cheerio.load(response.data);
    
    // Look for ticker links or news links
    $("a").each((i, el) => {
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      const href = $(el).attr("href");

      if (!title || !href || href.startsWith("javascript") || href === "#") return;

      const titleLower = title.toLowerCase();
      // Only capture links that seem to be notifications/results
      const isRelevant = ["cwe", "crp", "po", "clerk", "so", "rrb", "result", "score", "admit card", "call letter", "notice", "recruitment", "various post"].some(kw => titleLower.includes(kw));

      if (isRelevant && title.length > 10) {
        let fullHref = href;
        if (!href.startsWith("http")) {
          fullHref = `${IBPS_BASE_URL}/${href.startsWith('/') ? href.substring(1) : href}`;
        }

        items.push({
          board: "IBPS",
          exam_name: title.substring(0, 250),
          title: title.substring(0, 250),
          category: "notification",
          notification_date: new Date(),
          official_notification_url: fullHref.toLowerCase().endsWith('.pdf') ? fullHref : null,
          official_apply_url: fullHref,
          source_code: "IBPS"
        });
      }
    });

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
    console.error("IBPS Scraper Error:", error.message);
  }

  return items;
}

module.exports = { parseIbpsNotifications };
