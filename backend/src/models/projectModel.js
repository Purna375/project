const db = require("../config/db");

const Project = {
    createProject: async (
        userId,
        projectCode,
        domain,
        name,
        description,
        referencePdfUrl,
        deliveryDate,
        termsAgreed
    ) => {
        const sql = `INSERT INTO projects 
        (user_id, project_code, domain, project_name, description, reference_pdf_url, delivery_date, terms_agreed) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(sql, [
            userId,
            projectCode,
            domain,
            name,
            description,
            referencePdfUrl,
            deliveryDate,
            termsAgreed,
        ]);
    },

    getProjectsByUser: async (userId) => {
        const sql = "SELECT * FROM projects WHERE user_id = ?";
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    },

    updateProjectStatus: async (projectId, status, adminNotes) => {
        const sql =
            "UPDATE projects SET project_status = ?, admin_notes = ? WHERE project_id = ?";
        await db.execute(sql, [status, adminNotes, projectId]);
    },
};

module.exports = Project;