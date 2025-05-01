const db = require("../config/db");

const Report = {
    createReport: async (userId, projectId, title, description, imageUrl, pdfUrl) => {
        const sql =
            "INSERT INTO reports (user_id, project_id, title, description, image_url, pdf_url) VALUES (?, ?, ?, ?, ?, ?)";
        await db.execute(sql, [userId, projectId, title, description, imageUrl, pdfUrl]);
    },

    getReportsByUser: async (userId) => {
        const sql = "SELECT * FROM reports WHERE user_id = ?";
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    },

    updateReportStatus: async (reportId, status) => {
        const sql = "UPDATE reports SET report_status = ? WHERE report_id = ?";
        await db.execute(sql, [status, reportId]);
    },
};

module.exports = Report;