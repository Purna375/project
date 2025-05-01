const pool = require("../config/db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const otpMap = new Map();

exports.sendOtpToEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const [existing] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpMap.set(email, otp);
        console.log(`OTP for ${email}:`, otp);

        await transporter.sendMail({
            from: `"Project Portal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "OTP Verification Code",
            text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
        });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOtpAndRegister = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        const [existing] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const savedOtp = otpMap.get(email);
        if (!savedOtp || savedOtp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            "INSERT INTO users (email, password, is_verified) VALUES (?, ?, ?)",
            [email, hashedPassword, true]
        );

        otpMap.delete(email);

        const userId = result.insertId;

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

        const [userRows] = await pool.execute("SELECT * FROM users WHERE user_id = ?", [userId]);
        const newUser = userRows[0];

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: newUser.user_id,
                email: newUser.email,
                is_verified: newUser.is_verified
            }
        });

    } catch (error) {
        console.error("Error in verifyOtpAndRegister:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = otpMap.get(email);

        if (storedOtp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        await pool.execute(
            "UPDATE users SET is_verified = true WHERE email = ?",
            [email]
        );

        otpMap.delete(email);

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (!user.is_verified) {
            return res.status(401).json({ message: "Please verify your email to login" });
        }

        const [projects] = await pool.execute(
            "SELECT COUNT(*) AS count FROM projects WHERE user_id = ?",
            [user.user_id]
        );
        const hasProjects = projects[0].count > 0;

        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(201).json({
            message: "Login successful",
            token,
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified
            },
            hasProjects
        });

    } catch (error) {
        console.error("Error in loginUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.submitMultistepData = async (req, res) => {
    try {
      const { students, college, domain } = req.body;
      const userId = req.user?.id;

      console.log(userId);
      if (!userId) {
        return res.status(401).json({ error: "Session expired. Please log in again." });
      }
  
      if (!college?.name || !college?.branch || !college?.domain || !domain) {
        return res.status(400).json({ error: "Missing required college/domain fields" });
      }
  
      console.log("Received request body:", req.body);
  
      const [teamResult] = await pool.execute(
        "INSERT INTO student_teams (user_id, college, domain) VALUES (?, ?, ?)",
        [userId, college, domain]
      );
      const teamId = teamResult.insertId;
  
      if (students && Array.isArray(students)) {
        for (const student of students) {
          const { name, rollNo, branch, email, phone } = student;
  
          if (!name || !rollNo || !branch || !email || !phone) {
            return res.status(400).json({ error: "All student fields are required" });
          }
  
          console.log("Inserting student:", student);
  
          await pool.execute(
            "INSERT INTO students (user_id, team_id, name, roll_no, branch, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, teamId, name, rollNo, branch, email, phone]
          );
        }
      }
  
      res.status(200).json({
        message: "Data submitted successfully",
        team_id: teamId
      });
  
    } catch (error) {
      console.error("Multistep form submission error:", error);
      res.status(500).json({ error: "Server error submitting multistep form data" });
    }
  };  