const asyncHandler = require("express-async-handler");
const DailyActivity = require("../../modules/dailyActivitySchema");
const activitySchema = require("../../modules/activitySchema");

//  @desc   Add a new activity to today's activities
//  @route   POST /api/v1/dailyActivity/addActivity
//  @access  Protected (user)

exports.addActivity = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  const { type, price } = req.body;

  if (!type || !price || price <= 0) {
    return res.status(400).json({
      status: false,
      message: "الرجاء إدخال نوع النشاط وسعر صالح",
    });
  }

  const today = new Date().toISOString().split("T")[0];

  const currentDay = await DailyActivity.findOne({ user: userId, date: today });

  if (!currentDay) {
    return res.status(404).json({
      status: false,
      message: "اليوم غير موجود. ابدأ يوم جديد أولاً.",
    });
  }

  if (currentDay.currentBalance < price) {
    return res.status(400).json({
      status: false,
      message: "الرصيد غير كافي لإضافة هذا النشاط",
    });
  }

  await activitySchema.create({
    user: userId,
    dailyActivity: currentDay._id,
    type,
    price,
  });

  currentDay.currentBalance -= price;
  currentDay.totalSpent += price;
  await currentDay.save();

  const activities = await activitySchema
    .find({
      user: userId,
      dailyActivity: currentDay._id,
    })
    .sort({ createdAt: -1 });

  res.status(201).json({
    status: true,
    message: "تم إضافة النشاط بنجاح",
    data: {
      currentBalance: currentDay.currentBalance,
      totalSpent: currentDay.totalSpent,
      startingBalance: currentDay.startingBalance,
      date: currentDay.date,
      activities,
    },
  });
});
