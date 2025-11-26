const express = require("express");
const authServices = require("../services/authServices/protect");
const {
  addActivity,
  getTodayActivities,
  startNewDay,
  deleteActivity,
  updateActivity,
} = require("../services/dailyActivity/dailyActivityServices");

const { getMonthlyStats } = require("../services/dailyActivity/monthlyStats");

const router = express.Router();

router.use(authServices.protect);

router.route("/").post(addActivity).get(getTodayActivities);
router.route("/newDays").post(startNewDay);

router.route("/monthlyStats").get(getMonthlyStats);

router.route("/:id").delete(deleteActivity).put(updateActivity);

module.exports = router;
