const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const ExamNotification = require("../models/ExamNotification");
const ExamSource = require("../models/ExamSource");
const Candidate = require("../models/Candidate");

const notifications = [
  { id: 1, title: "PSC prelims announced", message: "PSC prelims announced for 2026-09-20", type: "New" },
  { id: 2, title: "Bank PO admit card released", message: "Admit card is now available", type: "Important" },
  { id: 3, title: "SSC CGL registration deadline", message: "Registration closes soon", type: "Urgent" },
];

const candidateController = {
  register: async (req, res) => {
    try {
      const { fullName, email, password } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingCandidate = await Candidate.findOne({ email });
      if (existingCandidate) {
        return res.status(409).json({ message: "Candidate already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newCandidate = new Candidate({
        fullName,
        email,
        password: hashedPassword,
      });

      await newCandidate.save();

      const token = jwt.sign({ id: newCandidate._id, email: newCandidate.email }, process.env.JWT_SECRET || "dev-secret", {
        expiresIn: "7d",
      });

      return res.status(201).json({ 
        token, 
        candidate: { 
          id: newCandidate._id, 
          fullName: newCandidate.fullName, 
          email: newCandidate.email 
        } 
      });
    } catch (error) {
      console.error("Register Error:", error);
      return res.status(500).json({ message: "Server error during registration" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const candidate = await Candidate.findOne({ email });
      if (!candidate) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, candidate.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: candidate._id, email: candidate.email }, process.env.JWT_SECRET || "dev-secret", {
        expiresIn: "7d",
      });

      return res.json({ 
        token, 
        candidate: { 
          id: candidate._id, 
          fullName: candidate.fullName, 
          email: candidate.email 
        } 
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ message: "Server error during login" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(401).json({ message: "Invalid session token format" });
      }

      const candidate = await Candidate.findById(req.user.id).select("-password");
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      return res.json({ 
        candidate: { 
          id: candidate._id, 
          fullName: candidate.fullName, 
          email: candidate.email, 
          phone: candidate.phone, 
          notificationsEnabled: candidate.notificationsEnabled, 
          preferences: candidate.preferences 
        } 
      });
    } catch (error) {
      console.error("Get Profile Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(401).json({ message: "Invalid session token format" });
      }

      const { fullName, phone, notificationsEnabled, preferences } = req.body;
      
      const candidate = await Candidate.findById(req.user.id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      if (fullName) candidate.fullName = fullName;
      if (phone !== undefined) candidate.phone = phone;
      if (notificationsEnabled !== undefined) candidate.notificationsEnabled = notificationsEnabled;
      if (preferences !== undefined) candidate.preferences = preferences;

      await candidate.save();

      return res.json({ 
        message: "Profile updated", 
        candidate: {
          id: candidate._id,
          fullName: candidate.fullName,
          email: candidate.email,
          phone: candidate.phone,
          notificationsEnabled: candidate.notificationsEnabled,
          preferences: candidate.preferences
        }
      });
    } catch (error) {
      console.error("Update Profile Error:", error);
      return res.status(500).json({ message: "Server error during update" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const candidate = await Candidate.findOne({ email });
      if (!candidate) {
        // Return 200 anyway to prevent email enumeration
        return res.json({ message: "If an account exists, a reset link has been sent." });
      }

      // STATELESS SECURE JWT: Combine global secret with user's current hashed password.
      // If the user changes their password, this token instantly becomes invalid.
      const secret = (process.env.JWT_SECRET || "dev-secret") + candidate.password;
      const payload = { email: candidate.email, id: candidate._id };
      const token = jwt.sign(payload, secret, { expiresIn: "15m" });

      const resetLink = `http://localhost:3000/reset-password?token=${token}&id=${candidate._id}`;

      // Use real SMTP if provided in .env, otherwise fallback to Ethereal test account
      let transporter;
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
          service: 'gmail', // or your SMTP host
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: '"GovExam Connect" <noreply@govexamconnect.com>',
        to: candidate.email,
        subject: "Password Reset Request",
        html: `
          <h3>Password Reset</h3>
          <p>You requested a password reset. Click the link below to set a new password. This link is valid for 15 minutes.</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });

      console.log("Password reset email sent: %s", nodemailer.getTestMessageUrl(info));

      return res.json({ message: "If an account exists, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return res.status(500).json({ message: "Server error during password reset request" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { id, token, newPassword } = req.body;

      if (!id || !token || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const candidate = await Candidate.findById(id);
      if (!candidate) {
        return res.status(404).json({ message: "Invalid reset link" });
      }

      const secret = (process.env.JWT_SECRET || "dev-secret") + candidate.password;

      try {
        jwt.verify(token, secret);
      } catch (err) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password and save
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      candidate.password = hashedPassword;
      await candidate.save();

      return res.json({ message: "Password successfully reset" });
    } catch (error) {
      console.error("Reset Password Error:", error);
      return res.status(500).json({ message: "Server error during password reset" });
    }
  },

  // Returns all exam notifications from DB, grouped by board
  getExams: async (req, res) => {
    try {
      const exams = await ExamNotification.find()
        .sort({ createdAt: -1 })
        .populate({ path: "source", select: "source_name source_code" });

      const formatted = exams.map((exam) => ({
        id: exam._id,
        title: exam.title,
        exam_name: exam.exam_name,
        board: exam.board,
        category: exam.category,
        notification_date: exam.notification_date ? exam.notification_date.toISOString().slice(0, 10) : null,
        apply_start_date: exam.apply_start_date ? exam.apply_start_date.toISOString().slice(0, 10) : null,
        apply_end_date: exam.apply_end_date ? exam.apply_end_date.toISOString().slice(0, 10) : null,
        exam_date: exam.exam_date ? exam.exam_date.toISOString().slice(0, 10) : null,
        official_notification_url: exam.official_notification_url,
        attachments: exam.attachments || [],
        description: exam.description || null,
        official_apply_url: exam.official_apply_url,
        status: exam.status,
        scraped_at: exam.createdAt,
      }));

      return res.json({ exams: formatted });
    } catch (error) {
      console.error("getExams DB error:", error.message);
      return res.status(500).json({ message: "Failed to load exams", error: error.message });
    }
  },

  // Returns SSC notifications scraped today from DB
  getTodaySSCExams: async (req, res) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const exams = await ExamNotification.find({
        board: "SSC",
        createdAt: { $gte: todayStart, $lte: todayEnd },
      })
      .sort({ createdAt: -1 })
      .populate({ path: "source", select: "source_name source_code" });

      const formatted = exams.map((exam) => ({
        id: exam._id,
        title: exam.title,
        exam_name: exam.exam_name,
        board: exam.board,
        category: exam.category,
        notification_date: exam.notification_date ? exam.notification_date.toISOString().slice(0, 10) : null,
        apply_start_date: exam.apply_start_date ? exam.apply_start_date.toISOString().slice(0, 10) : null,
        apply_end_date: exam.apply_end_date ? exam.apply_end_date.toISOString().slice(0, 10) : null,
        exam_date: exam.exam_date ? exam.exam_date.toISOString().slice(0, 10) : null,
        official_notification_url: exam.official_notification_url,
        attachments: exam.attachments || [],
        description: exam.description || null,
        official_apply_url: exam.official_apply_url,
        status: exam.status,
        scraped_at: exam.createdAt,
      }));

      return res.json({ exams: formatted, date: todayStart.toISOString().slice(0, 10), board: "SSC" });
    } catch (error) {
      console.error("getTodaySSCExams DB error:", error.message);
      return res.status(500).json({ message: "Failed to load today's SSC exams", error: error.message });
    }
  },

  // Returns a single exam by DB primary key
  getExamById: async (req, res) => {
    try {
      const exam = await ExamNotification.findById(req.params.id)
        .populate({ path: "source", select: "source_name source_code base_url" });

      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      return res.json({
        exam: {
          id: exam._id,
          title: exam.title,
          exam_name: exam.exam_name,
          board: exam.board,
          category: exam.category,
          notification_date: exam.notification_date ? exam.notification_date.toISOString().slice(0, 10) : null,
          apply_start_date: exam.apply_start_date ? exam.apply_start_date.toISOString().slice(0, 10) : null,
          apply_end_date: exam.apply_end_date ? exam.apply_end_date.toISOString().slice(0, 10) : null,
          exam_date: exam.exam_date ? exam.exam_date.toISOString().slice(0, 10) : null,
          official_notification_url: exam.official_notification_url,
          attachments: exam.attachments || [],
          description: exam.description || null,
          official_apply_url: exam.official_apply_url,
          status: exam.status,
          source: exam.source,
        },
      });
    } catch (error) {
      console.error("getExamById DB error:", error.message);
      return res.status(500).json({ message: "Failed to load exam", error: error.message });
    }
  },

  getNotifications: (req, res) => {
    return res.json({ notifications });
  },

  // Returns distinct exam boards that have notifications in the DB,
  // along with counts and the most recently scraped date
  getBoards: async (req, res) => {
    try {
      const rows = await ExamNotification.aggregate([
        {
          $group: {
            _id: "$board",
            count: { $sum: 1 },
            last_scraped: { $max: "$createdAt" }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const formattedRows = rows.map(row => ({
        board: row._id,
        count: row.count,
        last_scraped: row.last_scraped
      }));

      return res.json({ boards: formattedRows });
    } catch (error) {
      console.error("getBoards DB error:", error.message);
      return res.status(500).json({ message: "Failed to load boards", error: error.message });
    }
  },

  // Returns paginated notifications for a specific board
  getExamsByBoard: async (req, res) => {
    try {
      const board = (req.params.board || "").toUpperCase();
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
      const offset = (page - 1) * limit;
      const category = req.query.category || null;

      const where = { board };
      if (category) where.category = category;

      const countPromise = ExamNotification.countDocuments(where);
      const rowsPromise = ExamNotification.find(where)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate({ path: "source", select: "source_name source_code" });

      const [count, rows] = await Promise.all([countPromise, rowsPromise]);

      const formatted = rows.map((exam) => ({
        id: exam._id,
        title: exam.title,
        exam_name: exam.exam_name,
        board: exam.board,
        category: exam.category,
        notification_date: exam.notification_date ? exam.notification_date.toISOString().slice(0, 10) : null,
        apply_start_date: exam.apply_start_date ? exam.apply_start_date.toISOString().slice(0, 10) : null,
        apply_end_date: exam.apply_end_date ? exam.apply_end_date.toISOString().slice(0, 10) : null,
        exam_date: exam.exam_date ? exam.exam_date.toISOString().slice(0, 10) : null,
        official_notification_url: exam.official_notification_url,
        attachments: exam.attachments || [],
        description: exam.description || null,
        official_apply_url: exam.official_apply_url,
        status: exam.status,
        scraped_at: exam.createdAt,
      }));

      return res.json({
        exams: formatted,
        board,
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit,
      });
    } catch (error) {
      console.error("getExamsByBoard DB error:", error.message);
      return res.status(500).json({ message: "Failed to load board exams", error: error.message });
    }
  },
};

module.exports = candidateController;
