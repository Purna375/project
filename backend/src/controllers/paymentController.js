// const Razorpay = require('razorpay');

// const pool = require("../config/db");

// exports.createPayment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { projectId, totalAmount } = req.body;

//     const [projectExists] = await pool.execute(
//       "SELECT 1 FROM projects WHERE project_id = ?",
//       [projectId]
//     );
//     if (projectExists.length === 0) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     await pool.execute(
//       "INSERT INTO payments (user_id, project_id, total_amount, paid_amount, payment_status, pending_amount) VALUES (?, ?, ?, 0.00, 'pending', ?)",
//       [userId, projectId, totalAmount, totalAmount]
//     );

//     res.status(201).json({ message: "Payment entry created successfully!" });
//   } catch (error) {
//     console.error("Error creating payment:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// exports.getPendingPayments = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [pending] = await pool.execute(
//       `SELECT 
//          p.payment_id, p.project_id, pr.project_name, 
//          p.total_amount, p.paid_amount, p.pending_amount, 
//          p.payment_status, p.created_at
//        FROM payments p
//        INNER JOIN projects pr ON p.project_id = pr.project_id
//        WHERE p.user_id = ? AND (p.payment_status = 'pending' OR p.payment_status = 'partially_paid')
//        ORDER BY p.created_at DESC`,
//       [userId]
//     );

//     res.json({ success: true, payments: pending });
//   } catch (error) {
//     console.error("Error getting pending payments:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// exports.getPaymentHistory = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [history] = await pool.execute(
//       `SELECT 
//          p.payment_id, p.project_id, pr.project_name, 
//          p.total_amount, p.paid_amount, p.pending_amount, 
//          p.payment_status, p.created_at
//        FROM payments p
//        INNER JOIN projects pr ON p.project_id = pr.project_id
//        WHERE p.user_id = ?
//        ORDER BY p.created_at DESC`,
//       [userId]
//     );

//     res.json({ success: true, payments: history });
//   } catch (error) {
//     console.error("Error getting payment history:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// exports.confirmPayment = async (req, res) => {
//   try {
//     const { paymentId, amountPaid } = req.body;

//     const [paymentData] = await pool.execute(
//       "SELECT total_amount, paid_amount, pending_amount FROM payments WHERE payment_id = ?",
//       [paymentId]
//     );

//     if (paymentData.length === 0) {
//       return res.status(404).json({ message: "Payment not found" });
//     }

//     const { total_amount, paid_amount, pending_amount } = paymentData[0];
//     const newPaidAmount = parseFloat(paid_amount) + parseFloat(amountPaid);
//     const newPendingAmount = parseFloat(pending_amount) - parseFloat(amountPaid);

//     let newStatus = "partially_paid";
//     if (newPaidAmount >= total_amount) {
//       newStatus = "paid";
//       newPendingAmount = 0;
//     }

//     await pool.execute(
//       "UPDATE payments SET paid_amount = ?, payment_status = ?, pending_amount = ? WHERE payment_id = ?",
//       [newPaidAmount, newStatus, newPendingAmount, paymentId]
//     );
//     res.json({ message: "Payment updated successfully!" });
//   } catch (error) {
//     console.error("Error confirming payment:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// exports.createPaymentOrder = async (req, res) => {
//   try {
//     const { amount, projectId } = req.body;
//     const [project] = await pool.execute("SELECT * FROM projects WHERE project_id = ?", [projectId]);

//     if (!project.length) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     const order = await razorpay.orders.create({
//       amount: amount * 100,
//       currency: 'INR',
//       receipt: `order_${Date.now()}`,
//       notes: {
//         project_id: projectId
//       }
//     });

//     res.status(200).json({
//       message: "Payment order created",
//       orderId: order.id,
//       amount: amount * 100
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.capturePayment = async (req, res) => {
//   try {
//     const { paymentId, orderId, amount } = req.body;

//     const payment = await razorpay.payments.fetch(paymentId);
//     if (payment.status !== 'authorized') {
//       return res.status(400).json({ message: "Payment not authorized" });
//     }

//     const capturedPayment = await razorpay.payments.capture(paymentId, amount * 100);

//     await pool.execute("UPDATE payments SET payment_status = 'paid' WHERE order_id = ?", [orderId]);

//     res.status(200).json({ message: "Payment captured successfully", payment: capturedPayment });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getUserDashboardPayments = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [payments] = await pool.execute(
//       `SELECT 
//          p.payment_id,
//          p.project_id,
//          pr.project_name,
//          pr.project_code,
//          pr.domain,
//          p.total_amount,
//          p.paid_amount,
//          p.pending_amount,
//          p.payment_status,
//          p.created_at,
//          p.updated_at
//        FROM payments p
//        JOIN projects pr ON p.project_id = pr.project_id
//        WHERE p.user_id = ?
//        ORDER BY p.created_at DESC`,
//       [userId]
//     );

//     res.status(200).json({ success: true, payments });
//   } catch (error) {
//     console.error("Error fetching user dashboard payments:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };