const express = require("express");
const router  = express.Router();
const p       = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/",     p.getProducts);
router.get("/:id",  p.getProductById);

// Admin routes
router.post(  "/",           protect, adminOnly, p.createProduct);
router.put(   "/:id",        protect, adminOnly, p.updateProduct);
router.patch( "/:id/toggle", protect, adminOnly, p.toggleProduct);
router.delete("/:id",        protect, adminOnly, p.deleteProduct);

module.exports = router;
