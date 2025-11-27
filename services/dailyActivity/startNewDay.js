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