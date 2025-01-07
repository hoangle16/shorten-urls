const mongoose = require("mongoose");
const validator = require("validator");

const LinkSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          return validator.isURL(value);
        },
        message: "Invalid URL",
      },
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      validate: {
        validator: (value) =>
          !value || validator.isLength(value, { min: 4, max: 16 }),
        message: "Password must be between 4 and 16 characters",
      },
    },
    expiryDate: {
      type: Date,
      default: Date.now() + 3600000 * 24 * 3, // 3 days
    },
    description: {
      type: String,
      validate: {
        validator: (value) =>
          !value || validator.isLength(value, { max: 1024 }),
        message: "Description must be at most 1024 characters",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Link", LinkSchema);
