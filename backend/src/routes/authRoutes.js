const express = require("express");
const router  = express.Router();
const auth    = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register",       auth.register);
router.post("/login",          auth.login);
router.post("/login-admin",    auth.loginAdmin);
router.post("/refresh-token",  auth.refreshToken);
router.post("/logout",         auth.logout);

// Protected routes
router.get( "/profile",        protect, auth.getProfile);
router.put( "/profile",        protect, auth.updateProfile);
router.put( "/change-password",protect, auth.changePassword);

module.exports = router;
