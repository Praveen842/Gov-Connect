const cron = require("node-cron");
const { scrapeAllSources } = require("../services/scraperService");

function startNotificationScheduler() {
  cron.schedule("0 */6 * * *", async () => {
    try {
      await scrapeAllSources();
    } catch (error) {
      console.error("Notification scheduler failed:", error);
    }
  });
}

module.exports = { startNotificationScheduler };
