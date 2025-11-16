const asyncHandler = require("express-async-handler");
const Activity = require("../../modules/activitySchema");
const DailyActivity = require("../../modules/dailyActivitySchema");

exports.getMonthlyStats = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const userId = req.userModel._id;

  const now = new Date();
  const queryYear = year ? parseInt(year, 10) : now.getFullYear();
  const queryMonth = month ? parseInt(month, 10) : now.getMonth() + 1;

  const startDate = new Date(queryYear, queryMonth - 1, 1);
  const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

  // ================
  // Run in parallel
  // ================
  const [stats, balanceStats] = await Promise.all([
    Activity.aggregate([
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
    ]),

    DailyActivity.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalStartingBalance: { $sum: "$startingBalance" },
          totalCurrentBalance: { $sum: "$currentBalance" },
          totalSpent: { $sum: "$totalSpent" },
        },
      },
    ]),
  ]);

  // ===========================
  // Format category stats
  // ===========================
  const total = stats.reduce((sum, item) => sum + item.amount, 0);

  const finalData = stats.map((item) => ({
    category: item._id,
    amount: item.amount,
    percent: total > 0 ? item.amount / total : 0,
  }));

  // ===========================
  // Format balances
  // ===========================
  const monthlyBalances = balanceStats[0] || {
    totalStartingBalance: 0,
    totalCurrentBalance: 0,
    totalSpent: 0,
  };

  // ===========================
  // Response
  // ===========================
  res.status(200).json({
    status: true,
    message: "تم جلب الإحصائيات الشهرية بنجاح",
    totalStartingBalance: monthlyBalances.totalStartingBalance,
    totalCurrentBalance: monthlyBalances.totalCurrentBalance,
    totalSpentInMonth: monthlyBalances.totalSpent,
    data: finalData,
  });
});
