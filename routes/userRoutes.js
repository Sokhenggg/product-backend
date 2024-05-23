const express = require("express");
const router = express.Router();
const {
   registerUser,
   loginUser,
   sendResetPassword,
   resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", sendResetPassword);
router.post("/reset-password/:id/:token", resetPassword);

module.exports = router;
