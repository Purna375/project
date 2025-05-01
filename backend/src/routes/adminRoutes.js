const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeAdmin = require("../middlewares/authorizeAdmin");
const adminController = require("../controllers/adminController");

router.post('/login', adminController.loginAdmin);

router.use(authenticateUser, authorizeAdmin);

router.get("/projects",authorizeAdmin, adminController.getAllProjects);
router.patch("/projects/:id/status", adminController.updateProjectStatus);
router.patch("/projects/:id/price", adminController.setProjectPrice);
router.get("/reports", authorizeAdmin, adminController.getAllReports);
router.get("/payments", authorizeAdmin, adminController.getAllPayments);
router.post('/projects/approve/:projectId', authorizeAdmin, adminController.approveProject);
router.post("/projects/reject/:projectId", authorizeAdmin, adminController.rejectProject);
router.post('/reports/close/:reportId', authorizeAdmin, adminController.closeReport);
router.delete('/reports/:reportId', authorizeAdmin, adminController.deleteReport);
router.delete('/projects/delete/:projectId', authorizeAdmin, adminController.deleteProject);

module.exports = router;