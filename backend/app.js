const express = require("express");
const cors = require("cors");
require("dotenv").config();

const candidateRoutes = require("./routes/candidateRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scraperRoutes = require("./routes/scraperRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Government Exam Portal Backend Running");
});

app.use("/api/candidate", candidateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", scraperRoutes);

module.exports = app;