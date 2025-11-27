const asyncHandler = require("express-async-handler");
const DailyActivity = require("../../modules/dailyActivitySchema");
const activitySchema = require("../../modules/activitySchema");

//  @desc   Get today's activities
//  @route   GET /api/v1/dailyActivity
//  @access  Protected (user)
exports.getTodayActivities = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  const today = new Date().toISOString().split("T")[0];

  let currentDay = await DailyActivity.findOne({ user: userId, date: today });

  if (!currentDay) {
    const lastDay = await DailyActivity.findOne({ user: userId }).sort({
      date: -1,
    });

    if (!lastDay) {
      return res.status(404).json({
        status: false,
        message: "لا يوجد أي سجلات سابقة للمستخدم.",
      });
    }

    currentDay = await DailyActivity.create({
      user: userId,
      date: today,
      startingBalance: lastDay.currentBalance,
      currentBalance: lastDay.currentBalance,
      totalSpent: 0,
    });

    return res.status(200).json({
      status: true,
      message: "لا يوجد يوم نشط اليوم، تم جلب آخر يوم مسجل.",
      data: {
        currentBalance: currentDay.currentBalance,
        totalSpent: currentDay.totalSpent,
        startingBalance: currentDay.startingBalance,
        date: currentDay.date,
        activities: [],
      },
    });
  }

  const activities = await activitySchema.find({
    dailyActivity: currentDay._id,
  });

  res.status(200).json({
    status: true,
    message: "تم جلب أنشطة اليوم بنجاح",
    data: {
      currentBalance: currentDay.currentBalance,
      totalSpent: currentDay.totalSpent,
      startingBalance: currentDay.startingBalance,
      date: currentDay.date,
      activities,
    },
  });
});
