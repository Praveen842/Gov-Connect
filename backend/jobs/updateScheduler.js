const cron = require("node-cron");
const { scrapeAllSources } = require("../services/scraperService");
const ExamNotification = require("../models/ExamNotification");
const { scrapeCronExpression } = require("../config/scheduler");

function startUpdateScheduler() {
  // Scraper cron job (runs every 6 hours by default)
  cron.schedule(scrapeCronExpression, async () => {
    try {
      console.log("Running scheduled scraping job...");
      await scrapeAllSources();
    } catch (error) {
      console.error("Update scheduler failed:", error);
    }
  });

  // Cleanup cron job (runs daily at midnight)
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running expired notifications cleanup...");
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Delete if apply_end_date passed > 1 month ago, OR if no end date but notification > 6 months old
      const result = await ExamNotification.deleteMany({
        $or: [
          { apply_end_date: { $lt: oneMonthAgo } },
          { 
            apply_end_date: null,
            notification_date: { $lt: sixMonthsAgo } 
          }
        ]
      });
      console.log(`Cleaned up ${result.deletedCount} expired notifications.`);
    } catch (error) {
      console.error("Cleanup scheduler failed:", error);
    }
  });
}

module.exports = { startUpdateScheduler };
