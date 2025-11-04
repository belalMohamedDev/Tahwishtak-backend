const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    dailyActivity: {
      type: mongoose.Schema.ObjectId,
      ref: "DailyActivity",
      required: true,
    },
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
      type: String,
      default: () => {
        const now = new Date();
        return now.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
  },
  { timestamps: true },
);

// بعد إنشاء Activity جديد يتم تحديث DailyActivity تلقائيًا
activitySchema.post("save", async function () {
  const DailyActivity = mongoose.model("DailyActivity");
  const daily = await DailyActivity.findById(this.dailyActivity);
  if (daily) await daily.updateBalances();
});

module.exports = mongoose.model("Activity", activitySchema);
