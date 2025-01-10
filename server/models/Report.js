const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["abuse", "spam", "offensive", "other"],
    },
    description: {
      type: String,
      maxLength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedDate: {
      type: Date,
    },
    adminNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ linkId: 1 });

module.exports = mongoose.model("Report", ReportSchema);
