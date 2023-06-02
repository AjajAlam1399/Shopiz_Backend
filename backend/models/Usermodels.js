const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const crypto = require("crypto"); // bulid in module

const userSchemas = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter user Name"],
    trim: true,
    maxlength: [30, "Name should not exceed 30 character length"],
    minlength: [
      4,
      "Name should have atleast legth equall or more than 4 chracter",
    ],
  },
  email: {
    type: String,
    required: [true, "Enter user Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Enter user password"],
    maxlength: [
      20,
      "password should not have maximum length than 20 characters",
    ],
    minlength: [8, "Password minimum length should be 8"],
    select: false, // means when we run query .find() then it will not going to give password in it
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Encryptying password
userSchemas.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 10);
});

// JWT TOKEN
userSchemas.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare Password
userSchemas.methods.comparePassword = async function (enterPassword) {
  return await bcryptjs.compare(enterPassword, this.password);
};

// Genrating password Reset Token
userSchemas.methods.getResetPasswordToken = function () {
  // genrating token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const usermodels = new mongoose.model("users", userSchemas);

module.exports = usermodels;
