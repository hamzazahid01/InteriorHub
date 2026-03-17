const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const decoded = jwt.verify(token, secret);
    const admin = await Admin.findById(decoded.id).select("_id email");

    if (!admin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { protect };

