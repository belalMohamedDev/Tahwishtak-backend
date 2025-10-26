const jwt = require("jsonwebtoken");

// @ dec this func to create token , use in login and signup
// const creatToken = (payload, securityKey, expiredTime) =>
//   jwt.sign({ userId: payload }, securityKey, {
//     expiresIn: expiredTime,
//   });

const createToken = (payload, secretKey, expiresIn) =>
  jwt.sign(payload, secretKey, { expiresIn });

module.exports = createToken;
