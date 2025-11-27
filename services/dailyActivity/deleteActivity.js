const asyncHandler = require("express-async-handler");
const activitySchema = require("../../modules/activitySchema");

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
