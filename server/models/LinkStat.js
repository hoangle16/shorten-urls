const mongoose = require("mongoose");
const validator = require("validator");

const LinkStatSchema = new mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Link",
    },
    referrer: {
      type: String,
    },
    ip: {
      type: String,
      validate: {
        validator: (value) => validator.isIP(value),
        message: "Invalid IP address",
      },
    },
    os: {
      type: String,
    },
    browser: {
      type: String,
    },
    country: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LinkStat", LinkStatSchema);
