const scrapingService = require("../services/scrapingService");
const sourceService = require("../services/sourceService");

const scrapeCache = [];

async function runScrapingProcess() {
  const sources = sourceService.getSources();
  const results = await scrapingService.scrapeAllSources(sources);

  scrapeCache.length = 0;
  scrapeCache.push(...results);

  return results;
}

function getScrapeCache() {
  return scrapeCache;
}

function startScrapingScheduler(intervalMs = 1000 * 60 * 60) {
  runScrapingProcess().catch((error) => {
    console.error("Initial scraping run failed:", error);
  });

  setInterval(() => {
    runScrapingProcess().catch((error) => {
      console.error("Scheduled scraping run failed:", error);
    });
  }, intervalMs);
}

module.exports = {
  runScrapingProcess,
  getScrapeCache,
  startScrapingScheduler,
};
