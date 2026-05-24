const express = require("express");
const router  = express.Router();
const v       = require("../controllers/voucherController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public / user routes
router.get( "/active",   v.getActiveVouchers);
router.post("/validate", protect, v.validateVoucher);

// Admin routes
router.get( "/",     protect, adminOnly, v.getAllVouchers);
router.get( "/:id",  protect, adminOnly, v.getVoucherById);
router.post("/",     protect, adminOnly, v.createVoucher);
router.put( "/:id",  protect, adminOnly, v.updateVoucher);
router.delete("/:id",protect, adminOnly, v.deleteVoucher);

module.exports = router;
