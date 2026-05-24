const express = require("express");
const router  = express.Router();
const orderCtrl = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Admin routes (harus SEBELUM /:id agar tidak di-capture sebagai ID)
router.get( "/admin/all",           protect, adminOnly, orderCtrl.getAllOrders);
router.put( "/admin/:id/status",    protect, adminOnly, orderCtrl.updateOrderStatus);

// User routes
router.post("/",    protect, orderCtrl.createOrder);
router.get( "/my",  protect, orderCtrl.getMyOrders);
router.get( "/:id", protect, orderCtrl.getOrderById);

module.exports = router;
