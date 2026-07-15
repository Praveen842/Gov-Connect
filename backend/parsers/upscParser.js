const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");

const UPSC_BASE_URL = "https://upsc.gov.in";
// Allow self-signed certs which are common on govt websites
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function parseUpscNotifications(url) {
  // Override URL to target active-exams which contains the list of exams and subpages
  const targetUrl = "https://www.upsc.gov.in/examinations/active-exams";
  const items = [];
  try {
    const links = [];
    
    // Fetch multiple pages to get closer to 100 items
    for (let page = 0; page < 3; page++) {
      if (links.length >= 100) break;
      
      const pageUrl = page === 0 ? targetUrl : `${targetUrl}?page=${page}`;
      const response = await axios.get(pageUrl, {
        httpsAgent,
        timeout: 20000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
        }
      });

      const $ = cheerio.load(response.data);

      $(".views-row").each((i, el) => {
        if (links.length >= 100) return;
        const a = $(el).find("a").first();
        if (!a.length) return;
        const title = a.text().replace(/\s+/g, ' ').trim();
        let href = a.attr("href");
        if (title && href) {
          if (!href.startsWith("http")) href = `${UPSC_BASE_URL}${href.startsWith('/') ? href : '/' + href}`;
          links.push({ title, href });
        }
      });
    }

    // Iterate over links to find PDF attachments
    for (const linkObj of links) {
      let official_notification_url = null;
      let official_apply_url = linkObj.href;

      if (linkObj.href.toLowerCase().endsWith('.pdf')) {
        official_notification_url = linkObj.href;
      } else {
        // Fetch subpage to find PDF
        try {
          const subRes = await axios.get(linkObj.href, {
            httpsAgent,
            timeout: 10000,
            headers: {
               "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
            }
          });
          const sub$ = cheerio.load(subRes.data);
          const pdfLink = sub$("a").filter((i, el) => {
            const h = sub$(el).attr("href");
            return h && h.toLowerCase().endsWith('.pdf') && !h.includes('Common_Mistake');
          }).first().attr("href");

          if (pdfLink) {
            official_notification_url = pdfLink.startsWith("http") ? pdfLink : `${UPSC_BASE_URL}${pdfLink.startsWith('/') ? pdfLink : '/' + pdfLink}`;
          }
        } catch (subErr) {
          console.error(`Error fetching UPSC subpage ${linkObj.href}:`, subErr.message);
        }
      }

      items.push({
        board: "UPSC",
        exam_name: linkObj.title.substring(0, 250),
        title: linkObj.title.substring(0, 250),
        category: "notification",
        notification_date: new Date(),
        official_notification_url,
        official_apply_url,
        source_code: "UPSC"
      });
    }

  } catch (error) {
    console.error("UPSC Scraper Error:", error.message);
  }

  return items;
}

module.exports = { parseUpscNotifications };
