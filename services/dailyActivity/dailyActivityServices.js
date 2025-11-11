const asyncHandler = require("express-async-handler");
const DailyActivity = require("../../modules/dailyActivitySchema");
const activitySchema = require("../../modules/activitySchema ");

exports.startNewDay = asyncHandler(async (req, res) => {
  const { amountToAdd } = req.body;
  const userId = req.userModel._id;
  const today = new Date().toISOString().split("T")[0];

  const existingDay = await DailyActivity.findOne({
    user: userId,
    date: today,
  });

  if (existingDay) {
    existingDay.currentBalance += amountToAdd;
    await existingDay.save();

    return res.status(200).json({
      status: true,
      message: "تمت إضافة المبلغ إلى رصيد اليوم الحالي بنجاح",
      data: existingDay,
    });
  }

  const lastDay = await DailyActivity.findOne({ user: userId }).sort({
    date: -1,
  });

  const initialBalance = lastDay
    ? lastDay.currentBalance + amountToAdd
    : amountToAdd;

  const newDay = await DailyActivity.create({
    user: userId,
    date: today,
    startingBalance: lastDay ? lastDay.currentBalance : amountToAdd,
    currentBalance: initialBalance,
  });

  res.status(201).json({
    status: true,
    message: "تم بدء يوم جديد بنجاح",
    data: newDay,
  });
});

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

  const newActivity = await activitySchema.create({
    user: userId,
    dailyActivity: currentDay._id,
    type,
    price,
  });

  res.status(201).json({
    status: true,
    message: "تم إضافة النشاط بنجاح",
    data: newActivity,
  });
});

exports.getTodayActivities = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  const today = new Date().toISOString().split("T")[0];

  const currentDay = await DailyActivity.findOne({ user: userId, date: today });
  if (!currentDay) {
    return res.status(404).json({
      status: false,
      message: "اليوم غير موجود.",
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
