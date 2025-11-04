const mongoose = require("mongoose");

const dailyActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      default: () => new Date().toISOString().split("T")[0],
    },

    startingBalance: {
      type: Number,
      required: true,
    },

    currentBalance: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },
    todayActivite: [
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
      },
    ],
  },
  { timestamps: true },
);

dailyActivitySchema.methods.updateBalances = async function () {
  const Activity = mongoose.model("Activity");
  const activities = await Activity.find({ dailyActivity: this._id });
  const totalSpent = activities.reduce((sum, a) => sum + a.price, 0);
  this.totalSpent = totalSpent;
  this.currentBalance = this.startingBalance - totalSpent;
  await this.save();
};
const dailyActivityModel = mongoose.model("dailyActivity", dailyActivitySchema);

module.exports = dailyActivityModel;
