const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

function signToken(adminId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in environment variables.");
  return jwt.sign({ id: adminId }, secret, { expiresIn: "7d" });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await admin.comparePassword(String(password));
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(admin._id.toString());
    res.json({
      token,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
}

module.exports = { login };

