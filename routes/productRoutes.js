const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const {
   createProduct,
   updateProduct,
   deleteProduct,
   getProductsByUserId,
   getAllProducts,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.get("/:id", protect, getProductsByUserId);
router.get("/", getAllProducts);

module.exports = router;
