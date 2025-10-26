const authRoute = require("./authRoute");

const mountRoute = (app) => {
  app.use("/v1/api/auth", authRoute);
};

module.exports = mountRoute;
