const mongoose = require("mongoose");

const examUpdateSchema = new mongoose.Schema(
  {
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: "ExamNotification", required: true },
    update_type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    official_url: { type: String, default: null },
    update_date: { type: Date, default: null },
    status: { type: String, required: true, default: "active" },
  },
  {
    timestamps: true,
  }
);

examUpdateSchema.virtual("exam", {
  ref: "ExamNotification",
  localField: "exam_id",
  foreignField: "_id",
  justOne: true
});

examUpdateSchema.set('toObject', { virtuals: true });
examUpdateSchema.set('toJSON', { virtuals: true });

const ExamUpdate = mongoose.model("ExamUpdate", examUpdateSchema);
module.exports = ExamUpdate;
