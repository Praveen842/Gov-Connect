require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");
const { startUpdateScheduler } = require("./jobs/updateScheduler");
const { scrapeAllSources } = require("./services/scraperService");
require("./config/seedDatabase");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  console.log("Database connected successfully");

  // Run SSC scrape on startup to populate today's notifications
  setTimeout(async () => {
    try {
      console.log("Running startup scrape...");
      const summary = await scrapeAllSources();
      summary.forEach((s) => {
        console.log(`[Scraper] ${s.source}: inserted=${s.inserted}, updated=${s.updated}, errors=${s.errors.length}`);
      });
    } catch (err) {
      console.error("Startup scrape failed:", err.message);
    }
  }, 3000); // 3-second delay to allow seedDatabase to complete first
});

startUpdateScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});