const mongoose = require("mongoose");

const examSourceSchema = new mongoose.Schema(
  {
    source_name: { type: String, required: true },
    source_code: { type: String, required: true, unique: true },
    base_url: { type: String, required: true },
    notification_url: { type: String, default: null },
    result_url: { type: String, default: null },
    admit_card_url: { type: String, default: null },
    answer_key_url: { type: String, default: null },
    fetch_type: { type: String, required: true, default: "html" },
    status: { type: String, required: true, default: "active" },
  },
  {
    timestamps: true,
  }
);

const ExamSource = mongoose.model("ExamSource", examSourceSchema);
module.exports = ExamSource;
