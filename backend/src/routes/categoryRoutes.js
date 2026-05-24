const express = require("express");
const router  = express.Router();
const c       = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/",     c.getCategories);
router.get("/:id",  c.getCategoryById);

// Admin routes
router.post(  "/",    protect, adminOnly, c.createCategory);
router.put(   "/:id", protect, adminOnly, c.updateCategory);
router.delete("/:id", protect, adminOnly, c.deleteCategory);

module.exports = router;
