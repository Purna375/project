const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeAdminOrOwner = require("../middlewares/authorizeAdminOrOwner");
const upload = require("../middlewares/multerConfig");

router.get("/all", authorizeAdminOrOwner, reportController.getAllReports);
router.get("/user", authMiddleware, reportController.getUserReports);
router.post("/create", authMiddleware, upload.single("pdf"), reportController.createReport);
router.put("/update-status/:reportId", authorizeAdminOrOwner, reportController.updateReportStatus);
router.get("/check", authMiddleware,reportController.checkUserReports);

module.exports = router;