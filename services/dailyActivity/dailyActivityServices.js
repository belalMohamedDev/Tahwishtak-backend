const asyncHandler = require("express-async-handler");
const DailyActivity = require("../../modules/dailyActivitySchema");

exports.startNewDay = asyncHandler(async (req, res) => {
  const { startingBalance } = req.body;
  const userId = req.userModel._id;
  const today = new Date().toISOString().split("T")[0];

  const existingDay = await DailyActivity.findOne({
    user: userId,
    date: today,
  });
  if (existingDay) return res.status(400).json({ message: "اليوم بدأ بالفعل" });

  const newDay = await DailyActivity.create({
    user: userId,
    startingBalance,
    currentBalance: startingBalance,
  });

  res.status(201).json({
    message: "تم بدء يوم جديد بنجاح",
    data: newDay,
  });
});

exports.addActivity = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  const { type, price } = req.body;

  // التحقق من القيم
  if (!type || !price || price <= 0) {
    return res.status(400).json({
      status: false,
      message: "الرجاء إدخال نوع النشاط وسعر صالح",
    });
  }

  const today = new Date().toISOString().split("T")[0];

  // جلب اليوم الحالي للمستخدم
  const currentDay = await DailyActivity.findOne({ user: userId, date: today });

  if (!currentDay) {
    return res.status(404).json({
      status: false,
      message: "اليوم غير موجود. ابدأ يوم جديد أولاً.",
    });
  }

  // التحقق من الرصيد
  if (currentDay.currentBalance < price) {
    return res.status(400).json({
      status: false,
      message: "الرصيد غير كافي لإضافة هذا النشاط",
    });
  }

  // تحديث البيانات
  currentDay.todayActivite.push({
    type,
    price,
    time: new Date(),
  });

  currentDay.totalSpent += price;
  currentDay.currentBalance -= price;

  await currentDay.save();

  res.status(200).json({
    status: true,
    message: "تم إضافة النشاط بنجاح",
    data: currentDay,
  });
});

exports.getTodayActivities = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  const today = new Date().toISOString().split("T")[0];

  const currentDay = await DailyActivity.findOne({ user: userId, date: today });

  if (!currentDay) {
    return res.status(404).json({
      status: false,
      message: "لا يوجد أنشطة لليوم الحالي",
    });
  }

  res.status(200).json({
    status: true,
    message: "تم جلب أنشطة اليوم بنجاح",
    data: {
      date: currentDay.date,
      currentBalance: currentDay.currentBalance,
      totalSpent: currentDay.totalSpent,
      activities: currentDay.todayActivite,
    },
  });
});
