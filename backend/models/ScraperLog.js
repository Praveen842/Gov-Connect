const mongoose = require("mongoose");

const scraperLogSchema = new mongoose.Schema(
  {
    source_id: { type: mongoose.Schema.Types.ObjectId, ref: "ExamSource", required: true },
    job_name: { type: String, required: true },
    status: { type: String, required: true, default: "started" },
    records_inserted: { type: Number, required: true, default: 0 },
    records_updated: { type: Number, required: true, default: 0 },
    error_message: { type: String, default: null },
    started_at: { type: Date, required: true, default: Date.now },
    finished_at: { type: Date, default: null },
  },
  {
    timestamps: false,
  }
);

// Virtual for backward compatibility
scraperLogSchema.virtual("source", {
  ref: "ExamSource",
  localField: "source_id",
  foreignField: "_id",
  justOne: true
});

scraperLogSchema.set('toObject', { virtuals: true });
scraperLogSchema.set('toJSON', { virtuals: true });

const ScraperLog = mongoose.model("ScraperLog", scraperLogSchema);
module.exports = ScraperLog;
