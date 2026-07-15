const express = require("express");
const scraperController = require("../controllers/scraperController");

const router = express.Router();

router.get("/sources", scraperController.getSources);
router.post("/sources", scraperController.createSource);
router.put("/sources/:id", scraperController.updateSource);
router.delete("/sources/:id", scraperController.deleteSource);
router.post("/scraper/run", scraperController.runScraper);
router.get("/scraper/logs", scraperController.getLogs);
router.get("/scraper/status", scraperController.getStatus);

module.exports = router;
