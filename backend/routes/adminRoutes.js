const express = require("express");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/login", adminController.login);
router.get("/dashboard", adminController.getDashboard);
router.post("/notifications", adminController.createNotification);
router.post("/sources", adminController.createSource);

module.exports = router;
