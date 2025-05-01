const pool = require("../config/db");

exports.uploadInvoice = async (req, res) => {
    try {
        const { projectId, invoiceUrl } = req.body;

        await pool.execute(
            "INSERT INTO invoices (project_id, invoice_url) VALUES (?, ?)",
            [projectId, invoiceUrl]
        );

        res.status(201).json({ message: "Invoice uploaded successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const [invoices] = await pool.execute("SELECT * FROM invoices WHERE invoice_id = ?", [id]);

        if (invoices.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json(invoices[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const [invoices] = await pool.execute("SELECT * FROM invoices ORDER BY created_at DESC");

        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};