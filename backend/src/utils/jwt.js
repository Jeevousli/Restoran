const jwt = require("jsonwebtoken");

const ACCESS_SECRET  = process.env.JWT_SECRET  || "noesantara_access_secret_2024";
const REFRESH_SECRET = process.env.JWT_REFRESH  || "noesantara_refresh_secret_2024";

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "1d" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: "30d" }
  );

const generateTokenPair = (user) => ({
  accessToken:  generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET);

const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
};
