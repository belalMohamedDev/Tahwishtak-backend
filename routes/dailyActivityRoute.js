const express = require("express");
const authServices = require("../services/authServices/protect");
const {
  addActivity,
  getTodayActivities,
  startNewDay,
} = require("../services/dailyActivity/dailyActivityServices");

const router = express.Router();

router.use(authServices.protect);

router.route("/").post(addActivity).get(getTodayActivities);
router.route("/newDays").post(startNewDay);

module.exports = router;
