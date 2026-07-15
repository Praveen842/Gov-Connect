const mongoose = require("mongoose");

const examNotificationSchema = new mongoose.Schema(
  {
    source_id: { type: mongoose.Schema.Types.ObjectId, ref: "ExamSource", required: true },
    board: { type: String, required: true },
    exam_name: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, default: null },
    notification_date: { type: Date, default: null },
    apply_start_date: { type: Date, default: null },
    apply_end_date: { type: Date, default: null },
    exam_date: { type: Date, default: null },
    official_notification_url: { type: String, default: null },
    attachments: [
      {
        title: { type: String },
        url: { type: String }
      }
    ],
    description: { type: String, default: null },
    official_apply_url: { type: String, default: null },
    status: { type: String, required: true, default: "active" },
  },
  {
    timestamps: true,
  }
);

// Virtual for backward compatibility with 'source' alias used in populate
examNotificationSchema.virtual("source", {
  ref: "ExamSource",
  localField: "source_id",
  foreignField: "_id",
  justOne: true
});

examNotificationSchema.set('toObject', { virtuals: true });
examNotificationSchema.set('toJSON', { virtuals: true });

const ExamNotification = mongoose.model("ExamNotification", examNotificationSchema);
module.exports = ExamNotification;
