const sourceService = require("../services/sourceService");

const adminController = {
  login: (req, res) => {
    const { email, password } = req.body;

    if (email === "admin@example.com" && password === "admin123") {
      return res.json({
        token: "admin-demo-token",
        admin: { id: 1, email, role: "admin" },
      });
    }

    return res.status(401).json({ message: "Invalid admin credentials" });
  },

  getDashboard: (req, res) => {
    return res.json({
      stats: [
        { title: "Total applicants", value: "1,284" },
        { title: "Active exams", value: "24" },
        { title: "Unread alerts", value: "18" },
      ],
      notifications: [
        { id: 1, title: "SSC CGL registration reminder", audience: "All candidates", status: "Scheduled" },
        { id: 2, title: "Bank PO admit card update", audience: "Registered users", status: "Live" },
      ],
      sources: sourceService.getSources(),
    });
  },

  createNotification: (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    return res.status(201).json({
      message: "Notification created",
      notification: { id: Date.now(), title, message },
    });
  },

  createSource: (req, res) => {
    const { name, url, type } = req.body;
    if (!name || !url) {
      return res.status(400).json({ message: "Name and URL are required" });
    }

    const newSource = sourceService.addSource({ name, url, type });

    return res.status(201).json({
      message: "Source added",
      source: newSource,
    });
  },
};

module.exports = adminController;
