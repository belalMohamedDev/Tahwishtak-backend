const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseI18n = require("mongoose-i18n-localize");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "User Name is Required"],
    },

    email: {
      type: String,
      trim: true,
      unique: [true, "Email must be uniqe"],
      required: [true, "Email is required"],
      lowerCase: true,
    },

    password: {
      type: String,
      trim: true,
      minlength: [6, "Too shory user password"],
    },

    passwordChangedAt: Date,
    passwordRestExpire: Date,
    passwordRestCode: String,
    passwordRestVerified: Boolean,

    notifications: [
      {
        notificationId: { type: mongoose.Schema.ObjectId, ref: "notification" },
        isSeen: {
          type: Boolean,
          default: false,
        },
      },
    ],

    verifyAccount: Boolean,
  },
  { timestamps: true },
);

//work in create data
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  //hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.plugin(mongooseI18n, {
  locales: ["en", "ar"],
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
