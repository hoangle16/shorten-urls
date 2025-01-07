const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { roles } = require("../consts/consts");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => validator.isLength(value, { min: 6, max: 32 }),
        message: "Username must be between 6 and 32 characters",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => {
          validator.isEmail(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value) => validator.isLength(value, { min: 8, max: 128 }),
        message: "Password must be between 8 and 128 characters",
      },
      select: false, // Hide password in the response
    },
    firstName: {
      type: String,
      required: false,
      default: null,
      validate: {
        validator: (value) => validator.isLength(value, { min: 0, max: 64 }),
        message: "First name must be at most 64 characters",
      },
    },
    lastName: {
      type: String,
      required: false,
      default: null,
      validate: {
        validator: (value) => validator.isLength(value, { min: 0, max: 64 }),
        message: "Last name must be at most 64 characters",
      },
    },
    avatar: {
      url: {
        type: String,
        required: false,
        default: null,
        validate: {
          validator: (value) => {
            if (value) {
              return validator.isURL(value, { require_protocol: true });
            }

            return true;
          },
        },
      },
      publicId: {
        type: String,
        required: false,
        default: null,
      },
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: [roles.admin, roles.user],
      default: roles.user,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  // Hash the password before saving
  const user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
