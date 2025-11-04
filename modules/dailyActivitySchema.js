const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "حيوانات",
        "معاملات نقدية",
        "مواصلات",
        "سفر",
        "التسوق",
        "شراء مأكولات",
      ],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    time: {
      type: Date,
      default: Date.now,
    },

    dailyActivity: {
      type: mongoose.Schema.ObjectId,
      ref: "DailyActivity",
      required: true,
    },
  },
  { timestamps: true },
);

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;
