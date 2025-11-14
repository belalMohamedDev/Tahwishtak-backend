const asyncHandler = require("express-async-handler");
const activitySchema = require("../../modules/activitySchema");

exports.getMonthlyStats = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const userId = req.userModel._id;

  const now = new Date();

  const queryYear = year ? parseInt(year, 10) : now.getFullYear();
  const queryMonth = month ? parseInt(month, 10) : now.getMonth() + 1;

  const startDate = new Date(queryYear, queryMonth - 1, 1);

  const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

  const stats = await activitySchema.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$type",
        amount: { $sum: "$price" },
      },
    },
  ]);

  const total = stats.reduce((sum, item) => sum + item.amount, 0);

  const finalData = stats.map((item) => ({
    category: item._id,
    amount: item.amount,
    percent: total > 0 ? item.amount / total : 0,
  }));

  res.status(200).json({
    status: true,
    message: "تم جلب الإحصائيات الشهرية بنجاح",
    totalSpentInMonth: total,
    data: finalData,
  });
});
