const express = require("express");
const candidateController = require("../controllers/candidateController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", candidateController.register);
router.post("/login", candidateController.login);
router.post("/forgot-password", candidateController.forgotPassword);
router.post("/reset-password", candidateController.resetPassword);
router.get("/profile", authMiddleware, candidateController.getProfile);
router.put("/profile", authMiddleware, candidateController.updateProfile);
router.get("/boards", authMiddleware, candidateController.getBoards);
router.get("/exams/today-ssc", authMiddleware, candidateController.getTodaySSCExams);
router.get("/exams/board/:board", authMiddleware, candidateController.getExamsByBoard);
router.get("/exams", authMiddleware, candidateController.getExams);
router.get("/exams/:id", authMiddleware, candidateController.getExamById);
router.get("/notifications", authMiddleware, candidateController.getNotifications);

module.exports = router;
