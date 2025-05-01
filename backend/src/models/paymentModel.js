const db = require("../config/db");

const Payment = {
    createPayment: async (userId, projectId, totalAmount) => {
        const sql =
            "INSERT INTO payments (user_id, project_id, total_amount) VALUES (?, ?, ?)";
        await db.execute(sql, [userId, projectId, totalAmount]);
    },

    updatePayment: async (paymentId, amountPaid) => {
        const sql =
            "UPDATE payments SET paid_amount = paid_amount + ? WHERE payment_id = ?";
        await db.execute(sql, [amountPaid, paymentId]);
    },

    getPaymentByProject: async (projectId) => {
        const sql = "SELECT * FROM payments WHERE project_id = ?";
        const [rows] = await db.execute(sql, [projectId]);
        return rows.length ? rows[0] : null;
    },
};

module.exports = Payment;