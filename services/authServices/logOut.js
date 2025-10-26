const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const i18n = require("i18n");
const redisClient = require("../../config/redisConnection");

const ApiError = require("../../utils/apiError/apiError");

// @ dec log out
// @ route Post  /api/vi/auth/logout
// @ access Public

exports.logOut = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError(i18n.__("refreshTokenRequired"), 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    );
  } catch (err) {
    return next(new ApiError(i18n.__("invalidRefreshToken"), 400));
  }

  const { userId, sessionId } = decoded;

  await redisClient.del(`refreshToken:${userId}:${sessionId}`);

  res.status(200).json({
    status: true,
    message: i18n.__("loggedOutSuccessfully"),
  });
});
