const asyncHandler = require("express-async-handler");
const DailyActivity = require("../../modules/dailyActivitySchema");
const activitySchema = require("../../modules/activitySchema");

//  @desc    Start a new day or add amount to existing day
//  @route   POST /api/v1/dailyActivity/newDays
//  @access  Protected (user)
exports.startNewDay = asyncHandler(async (req, res) => {
  const { amountToAdd } = req.body;
  const userId = req.userModel._id;
  const today = new Date().toISOString().split("T")[0];

  const existingDay = await DailyActivity.findOne({
    user: userId,
    date: today,
  });

  if (existingDay) {
    existingDay.startingBalance += amountToAdd;

    existingDay.currentBalance += amountToAdd;

    await existingDay.save();

    const activities = await activitySchema.find({
      dailyActivity: existingDay._id,
    });

    return res.status(200).json({
      status: true,
      message: "تمت إضافة المبلغ إلى رصيد اليوم الحالي بنجاح",
      data: {
        _id: existingDay._id,
        user: existingDay.user,
        date: existingDay.date,
        startingBalance: existingDay.startingBalance,
        currentBalance: existingDay.currentBalance,
        totalSpent: existingDay.totalSpent,
        activities,
      },
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
    startingBalance: initialBalance,
    currentBalance: initialBalance,
  });

  const activities = await activitySchema.find({
    dailyActivity: newDay._id,
  });

  res.status(201).json({
    status: true,
    message: "تم بدء يوم جديد بنجاح",
    data: {
      _id: newDay._id,
      user: newDay.user,
      date: newDay.date,
      startingBalance: newDay.startingBalance,
      currentBalance: newDay.currentBalance,
      totalSpent: newDay.totalSpent,
      activities,
    },
  });
});

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

//  @desc   Delete an activity from today's activities
//  @route   DELETE /api/v1/dailyActivity/:activityId
//  @access  Protected (user)
exports.deleteActivity = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  const { activityId } = req.params;

  if (!activityId) {
    return res.status(400).json({
      status: false,
      message: "يجب إرسال معرف النشاط",
    });
  }

  const activity = await activitySchema
    .findOne({ _id: activityId, user: userId })
    .populate("dailyActivity");

  if (!activity) {
    return res.status(404).json({
      status: false,
      message: "النشاط غير موجود",
    });
  }

  const { dailyActivity } = activity;

  if (!dailyActivity) {
    return res.status(404).json({
      status: false,
      message: "اليوم غير موجود",
    });
  }

  dailyActivity.currentBalance += activity.price;
  dailyActivity.totalSpent -= activity.price;

  await dailyActivity.save();

  await activity.deleteOne();

  const activities = await activitySchema
    .find({
      user: userId,
      dailyActivity: dailyActivity._id,
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: true,
    message: "تم حذف النشاط بنجاح",
    data: {
      currentBalance: dailyActivity.currentBalance,
      totalSpent: dailyActivity.totalSpent,
      startingBalance: dailyActivity.startingBalance,
      date: dailyActivity.date,
      activities,
    },
  });
});

//  @desc   Update an activity from today's activities
//  @route   PUT /api/v1/dailyActivity/:activityId
//  @access  Protected (user)
exports.updateActivity = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  const { activityId } = req.params;
  const { type, price } = req.body;

  if (!type || !price || price <= 0) {
    return res.status(400).json({
      status: false,
      message: "الرجاء إدخال نوع النشاط وسعر صالح",
    });
  }

  const activity = await activitySchema.findOne({
    _id: activityId,
    user: userId,
  });

  if (!activity) {
    return res.status(404).json({
      status: false,
      message: "النشاط غير موجود",
    });
  }

  const dailyActivity = await DailyActivity.findById(activity.dailyActivity);

  if (!dailyActivity) {
    return res.status(404).json({
      status: false,
      message: "اليوم غير موجود",
    });
  }

  const oldPrice = activity.price;
  const difference = price - oldPrice;

  // Check if user has enough balance
  if (difference > 0 && dailyActivity.currentBalance < difference) {
    return res.status(400).json({
      status: false,
      message: "الرصيد غير كافي لتعديل سعر هذا النشاط",
    });
  }

  // Update balances
  dailyActivity.currentBalance -= difference;

  dailyActivity.totalSpent = dailyActivity.totalSpent - oldPrice + price;

  await dailyActivity.save();

  // Update activity
  activity.type = type;
  activity.price = price;
  await activity.save();

  // Fetch updated activities list
  const activities = await activitySchema
    .find({
      user: userId,
      dailyActivity: dailyActivity._id,
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: true,
    message: "تم تعديل النشاط بنجاح",
    data: {
      currentBalance: dailyActivity.currentBalance,
      totalSpent: dailyActivity.totalSpent,
      startingBalance: dailyActivity.startingBalance,
      date: dailyActivity.date,
      activities,
    },
  });
});

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
