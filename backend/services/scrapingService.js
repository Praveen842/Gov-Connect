const http = require("http");
const https = require("https");
const { URL } = require("url");
const cheerio = require("cheerio");

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    try {
      const client = url.startsWith("https") ? https : http;
      client
        .get(url, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, url).toString();
            return resolve(fetchHtml(redirectUrl));
          }

          let html = "";
          res.on("data", (chunk) => {
            html += chunk;
          });

          res.on("end", () => {
            resolve(html);
          });
        })
        .on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

function stripHtmlTags(value) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
}

function normalizeLink(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch (error) {
    return href;
  }
}

function parseDateFromText(value) {
  const text = String(value || "").trim();
  const patterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
    /(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*)\s*,?\s*(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const dateText = match[1];
      const parsed = Date.parse(dateText);
      if (!Number.isNaN(parsed)) {
        return new Date(parsed).toISOString();
      }
    }
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function buildItem({ id, source, title, link, summary, publishedAt }) {
  return {
    id,
    sourceId: source.id,
    sourceName: source.board || source.name,
    title: stripHtmlTags(title) || source.name,
    link: link ? normalizeLink(link, source.url) : source.url,
    summary: stripHtmlTags(summary || title).slice(0, 180),
    publishedAt: publishedAt || new Date().toISOString(),
  };
}

function extractJsonLdItems($, source) {
  const items = [];
  const scripts = $('script[type="application/ld+json"]');

  scripts.each((index, element) => {
    try {
      const json = JSON.parse($(element).contents().text());

      function visitNode(node) {
        if (!node || typeof node !== "object") {
          return;
        }

        const type = String(node["@type"] || "").toLowerCase();
        const isArticle = type.includes("newsarticle") || type.includes("article") || type.includes("report") || type.includes("event") || type.includes("webpage") || type.includes("itemlist");

        if (isArticle) {
          const title = node.headline || node.name || node.title || node.alternateName || node.description;
          const link = node.url || node.mainEntityOfPage || source.url;
          const summary = node.description || node.abstract || title;
          const publishedAt = node.datePublished || node.dateCreated || node.dateModified || parseDateFromText(node.datePublished) || new Date().toISOString();

          if (title) {
            items.push(buildItem({
              id: `${source.id}-jsonld-${items.length}`,
              source,
              title,
              link,
              summary,
              publishedAt,
            }));
          }
        }

        Object.values(node).forEach((child) => {
          if (Array.isArray(child)) {
            child.forEach(visitNode);
          } else if (typeof child === "object") {
            visitNode(child);
          }
        });
      }

      visitNode(json);
    } catch (error) {
      // ignore malformed JSON-LD
    }
  });

  return items;
}

function extractBlockItems($, source) {
  const selectors = source.selectors?.itemSelector || "article, .notice, .announcement, .news-item, .view-content, .news-block, .news-list";
  const titleSelector = source.selectors?.titleSelector || "h1, h2, h3, h4, .field-title, .title";
  const linkSelector = source.selectors?.linkSelector || "a[href]";
  const dateSelector = source.selectors?.dateSelector || "time, .date, .published, .news-date, .search-result-date";
  const keywordPattern = /(exam|notification|admit card|registration|result|recruitment|govt|opportunity|notice|application|recruitment notice|final result|scorecard|merit list|answer key|admit card released|admit card issued)/i;

  return $(selectors)
    .toArray()
    .filter((element) => keywordPattern.test($(element).text()))
    .map((element, index) => {
      const title = stripHtmlTags($(element).find(titleSelector).first().text()) || stripHtmlTags($(element).text()).slice(0, 120);
      const rawLink = $(element).find(linkSelector).first().attr("href");
      const link = rawLink ? normalizeLink(rawLink, source.url) : source.url;
      const summary = stripHtmlTags($(element).find("p").first().text()) || stripHtmlTags($(element).text()).slice(0, 180);
      const rawDate = stripHtmlTags($(element).find(dateSelector).first().text()) || stripHtmlTags($(element).text());
      const publishedAt = parseDateFromText(rawDate) || new Date().toISOString();

      return buildItem({
        id: `${source.id}-block-${index}`,
        source,
        title,
        link,
        summary,
        publishedAt,
      });
    });
}

function extractHeadingLinkItems($, source) {
  const keywordPattern = /(exam|notification|admit card|registration|result|recruitment|govt|opportunity|notice|application|recruitment notice|final result|scorecard|merit list|answer key|admit card released)/i;

  return [
    ...$("h1, h2, h3, h4")
      .toArray()
      .map((element, index) => {
        const title = stripHtmlTags($(element).text());
        if (!keywordPattern.test(title)) {
          return null;
        }

        const parent = $(element).closest("a")[0] ? $(element).closest("a") : $(element).parent();
        const rawLink = $(parent).find("a[href]").first().attr("href") || $(element).closest("a").attr("href");
        const link = rawLink ? normalizeLink(rawLink, source.url) : source.url;
        const summary = title;
        const publishedAt = parseDateFromText($(element).text()) || new Date().toISOString();

        return buildItem({
          id: `${source.id}-heading-${index}`,
          source,
          title,
          link,
          summary,
          publishedAt,
        });
      })
      .filter(Boolean),
  ];
}

function extractPageTitle(html, source) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? stripHtmlTags(titleMatch[1]) : `${source.name} update`;

  return [
    buildItem({
      id: `${source.id}-page-title`,
      source,
      title,
      link: source.url,
      summary: title.slice(0, 180),
      publishedAt: new Date().toISOString(),
    }),
  ];
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.sourceId}-${item.title}-${item.link}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function extractItemsFromHtml(html, source) {
  const $ = cheerio.load(html, { decodeEntities: true });
  const jsonLdItems = extractJsonLdItems($, source);
  const blockItems = extractBlockItems($, source);
  const headingItems = extractHeadingLinkItems($, source);
  const pageTitleItems = extractPageTitle(html, source);

  const allItems = [...jsonLdItems, ...blockItems, ...headingItems, ...pageTitleItems];
  return dedupeItems(allItems).slice(0, 20);
}

async function scrapeSource(source) {
  const html = await fetchHtml(source.url);
  return extractItemsFromHtml(html, source);
}

async function scrapeAllSources(sources) {
  const result = [];

  for (const source of sources) {
    try {
      const items = await scrapeSource(source);
      result.push({ source, items });
    } catch (error) {
      result.push({
        source,
        items: [],
        error: error.message || "Failed to fetch source",
      });
    }
  }

  return result;
}

module.exports = {
  scrapeSource,
  scrapeAllSources,
};
