const asyncHandler = require("express-async-handler");
const DailyActivity = require("../../modules/dailyActivitySchema");
const activitySchema = require("../../modules/activitySchema");

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
