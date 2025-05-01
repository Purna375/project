const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authenticateUser = require("../middlewares/authMiddleware");

router.post("/upload", authenticateUser, invoiceController.uploadInvoice);
router.get("/:id", authenticateUser, invoiceController.getInvoiceById);
router.get("/all", authenticateUser, invoiceController.getAllInvoices);

module.exports = router;