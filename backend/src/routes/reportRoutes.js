const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeAdminOrOwner = require("../middlewares/authorizeAdminOrOwner");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reports/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/all", authorizeAdminOrOwner, reportController.getAllReports);
router.get("/user", authMiddleware, reportController.getUserReports);
router.post("/create", authMiddleware, upload.fields([{ name: "image" }, { name: "pdf" }]), reportController.createReport);
router.put("/update-status/:reportId", authorizeAdminOrOwner, reportController.updateReportStatus);
router.get("/check", authMiddleware,reportController.checkUserReports);

module.exports = router;