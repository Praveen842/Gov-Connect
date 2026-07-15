const ExamSource = require("../models/ExamSource");
const ExamNotification = require("../models/ExamNotification");
const ScraperLog = require("../models/ScraperLog");
const { scrapeAllSources } = require("../services/scraperService");

const scraperController = {
  runScraper: async (req, res) => {
    try {
      const summary = await scrapeAllSources();
      return res.json({ message: "Scraper executed", summary });
    } catch (error) {
      return res.status(500).json({ message: "Scraper execution failed", error: error.message });
    }
  },

  getLogs: async (req, res) => {
    try {
      const logs = await ScraperLog.find()
        .sort({ started_at: -1 })
        .limit(50)
        .populate("source");

      return res.json({ logs });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get logs", error: error.message });
    }
  },

  getStatus: async (req, res) => {
    try {
      const lastLog = await ScraperLog.findOne().sort({ started_at: -1 });
      return res.json({ status: lastLog ? lastLog.status : "unknown", lastRun: lastLog ? lastLog.finished_at : null });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get status", error: error.message });
    }
  },

  getSources: async (req, res) => {
    try {
      const sources = await ExamSource.find();
      return res.json({ sources });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get sources", error: error.message });
    }
  },

  createSource: async (req, res) => {
    try {
      const { source_name, source_code, base_url, notification_url, result_url, admit_card_url, answer_key_url, fetch_type, status } = req.body;
      const source = await ExamSource.create({
        source_name,
        source_code,
        base_url,
        notification_url,
        result_url,
        admit_card_url,
        answer_key_url,
        fetch_type: fetch_type || "html",
        status: status || "active",
      });
      return res.status(201).json({ source });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create source", error: error.message });
    }
  },

  updateSource: async (req, res) => {
    try {
      const source = await ExamSource.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!source) {
        return res.status(404).json({ message: "Source not found" });
      }
      return res.json({ source });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update source", error: error.message });
    }
  },

  deleteSource: async (req, res) => {
    try {
      const source = await ExamSource.findByIdAndDelete(req.params.id);
      if (!source) {
        return res.status(404).json({ message: "Source not found" });
      }
      return res.json({ message: "Source deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete source", error: error.message });
    }
  },

  getExams: async (req, res) => {
    try {
      const exams = await ExamNotification.find().sort({ notification_date: -1 });
      return res.json({ exams });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get exams", error: error.message });
    }
  },

  getExamById: async (req, res) => {
    try {
      const exam = await ExamNotification.findById(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      return res.json({ exam });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get exam", error: error.message });
    }
  },

  getLatestExams: async (req, res) => {
    try {
      const exams = await ExamNotification.find().sort({ notification_date: -1 }).limit(20);
      return res.json({ exams });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get latest exams", error: error.message });
    }
  },

  getExamsByBoard: async (req, res) => {
    try {
      const exams = await ExamNotification.find({ board: req.params.board }).sort({ notification_date: -1 });
      return res.json({ exams });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get exams by board", error: error.message });
    }
  },

  getExamsByCategory: async (req, res) => {
    try {
      const exams = await ExamNotification.find({ category: req.params.category }).sort({ notification_date: -1 });
      return res.json({ exams });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get exams by category", error: error.message });
    }
  },
};

module.exports = scraperController;
