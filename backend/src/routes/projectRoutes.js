const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController.js");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeAdminOrOwner = require("../middlewares/authorizeAdminOrOwner.js");
const { validateProjectData } = require("../middlewares/inputValidationMiddleware.js");
const upload = require("../middlewares/multerConfig.js");


router.post(
  "/request",
  authenticateUser,
  upload.single("referenceFile"),
  validateProjectData,
  projectController.createProject
);

router.get("/user", authenticateUser, projectController.getProjectsByUser);
router.get("/all", authenticateUser, projectController.getAllProjects);
router.get("/generate-id", authenticateUser, projectController.getProjectId);
router.get("projects/:id", authenticateUser, projectController.getProjectById);
router.patch("/change-domain/:id", authenticateUser, projectController.updateDomain);
router.put('/projects/:id/status', authenticateUser, authorizeAdminOrOwner, projectController.updateProjectStatus);
router.post('/generate-invoice', authenticateUser, authorizeAdminOrOwner, projectController.generateInvoice);
router.post('/projects', upload.single('projectFile'), projectController.createProject);

router.put(
  "/:id",
  authenticateUser,
  authorizeAdminOrOwner,
  validateProjectData,
  projectController.updateProject
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeAdminOrOwner,
  projectController.deleteProject
);


module.exports = router;