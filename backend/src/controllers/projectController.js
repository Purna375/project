const pool = require("../config/db");
const generateProjectCode = require("../utils/generateProjectCode");
const nodemailer = require("nodemailer");
const path = require("path");
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.createProject = async (req, res) => {
  try {
    const { userId, projectName, domain, description, deliveryDate, termsAgreed } = req.body;
    const uploadedFile = req.file;

    console.log("Request Body:", req.body);
    console.log("Uploaded File:", uploadedFile);

    if (!userId || !projectName || !domain || !deliveryDate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const [userRows] = await pool.execute(
        "SELECT email FROM users WHERE user_id = ?",
        [userId]
    );      

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userEmail = userRows[0].email;
    const projectCode = await generateProjectCode();
    const projectStatus = "pending";

    const referencePdfUrl = uploadedFile
      ? path.join("uploads", uploadedFile.filename)
      : null;

    await pool.execute(
      `INSERT INTO projects 
      (user_id, project_code, project_name, domain, description, reference_pdf_url, delivery_date, terms_agreed, project_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        projectCode,
        projectName,
        domain,
        description || "",
        referencePdfUrl,
        deliveryDate,
        termsAgreed || false,
        projectStatus,
      ]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Project Portal" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Your project has been submitted!",
      html: `
        <h2>Hi,</h2>
        <p>Your project request has been submitted successfully with the following details:</p>
        <ul>
          <li><strong>Project Code:</strong> ${projectCode}</li>
          <li><strong>Name:</strong> ${projectName}</li>
          <li><strong>Domain:</strong> ${domain}</li>
          <li><strong>Delivery Date:</strong> ${deliveryDate}</li>
          <li><strong>Description:</strong> ${description || "N/A"}</li>
          <li><strong>File:</strong> ${referencePdfUrl ? referencePdfUrl : "None"}</li>
        </ul>
        <p>You will be contacted shortly regarding the approval and pricing details.</p>
        <p>Thank you!</p>
      `,
    });

    res.status(201).json({
      message: "Project request submitted and email sent!",
      projectCode,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
    try {
        const [projects] = await pool.execute("SELECT * FROM projects");
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const [project] = await pool.execute("SELECT * FROM projects WHERE project_id = ?", [id]);

        if (project.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json(project[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { projectName, domain, description, referenceFile, deliveryDate, termsAgreed, projectStatus, adminNotes, projectFileUrl } = req.body;

        const [result] = await pool.execute(
            "UPDATE projects SET project_name = ?, domain = ?, description = ?, reference_pdf_url = ?, delivery_date = ?, terms_agreed = ?, project_status = ?, admin_notes = ?, project_file_url = ? WHERE project_id = ?",
            [projectName, domain, description, referenceFile, deliveryDate, termsAgreed, projectStatus, adminNotes, projectFileUrl, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found or not updated" });
        }

        res.json({ message: "Project updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute("DELETE FROM projects WHERE project_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProjectId = async (req, res) => {
    try {
        console.log("getProjectId route hit");
        const projectId = await generateProjectCode();
        res.status(200).json({ projectId });
    } catch (error) {
        console.error("Error generating project ID:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateDomain = async (req, res) => {
  const { id } = req.params;
  const { domain } = req.body;

  try {
    const [result] = await pool.execute(
      "UPDATE projects SET domain = ? WHERE project_id = ?",
      [domain, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Domain updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [projects] = await pool.execute(
      `SELECT 
         p.*, 
         pay.payment_status, 
         pay.paid_amount, 
         pay.total_amount 
       FROM projects p
       LEFT JOIN payments pay ON p.project_id = pay.project_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );    

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    const { projectId, status, notes } = req.body;

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.execute(
      "UPDATE projects SET project_status = ?, admin_notes = ? WHERE project_id = ?",
      [status, notes, projectId]
    );

    res.status(200).json({ message: "Project status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateInvoice = (req, res) => {
  const { projectId, userId, totalAmount } = req.body;

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(`invoices/invoice_${projectId}.pdf`));

  doc.fontSize(18).text('Invoice', { align: 'center' });
  doc.fontSize(12).text(`Project ID: ${projectId}`);
  doc.text(`User ID: ${userId}`);
  doc.text(`Total Amount: ${totalAmount}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);

  doc.end();

  res.status(200).json({ message: 'Invoice generated', invoiceUrl: `/invoices/invoice_${projectId}.pdf` });
};