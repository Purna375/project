const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const { validateOTP } = require("../middlewares/validateOTP.js");
const authenticateUser = require("../middlewares/authMiddleware.js");

router.post("/register",validateOTP, userController.verifyOtpAndRegister);
router.post("/login", userController.loginUser);
router.post("/verify-otp", validateOTP ,userController.verifyOTP);
router.post("/send-otp", userController.sendOtpToEmail);
router.post("/submit-multistep-data", authenticateUser, userController.submitMultistepData);

module.exports = router;