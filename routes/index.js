const authRoute = require("./authRoute");
const dailyActivityRoute = require("./dailyActivityRoute");

const mountRoute = (app) => {
  app.use("/v1/api/auth", authRoute);
  app.use("/v1/api/dailyActivity", dailyActivityRoute);
};

module.exports = mountRoute;
