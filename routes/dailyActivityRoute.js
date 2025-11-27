const express = require("express");
const authServices = require("../services/authServices/protect");
const { addActivity } = require("../services/dailyActivity/addActivity");

const { deleteActivity } = require("../services/dailyActivity/deleteActivity");

const {
  getTodayActivities,
} = require("../services/dailyActivity/getTodayActivities");
const { startNewDay } = require("../services/dailyActivity/startNewDay");

const { updateActivity } = require("../services/dailyActivity/updateActivity");

const { getMonthlyStats } = require("../services/dailyActivity/monthlyStats");

const router = express.Router();

router.use(authServices.protect);

router.route("/").post(addActivity).get(getTodayActivities);
router.route("/newDays").post(startNewDay);

router.route("/monthlyStats").get(getMonthlyStats);

router.route("/:activityId").delete(deleteActivity).put(updateActivity);

module.exports = router;
