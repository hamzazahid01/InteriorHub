const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables.");
  }

  try {
    await mongoose.connect(mongoUri, dbName ? { dbName } : undefined);
    console.log("MongoDB connected");
  } catch (err) {
    const msg = String(err?.message || err || "");
    const isSrvDnsIssue =
      msg.includes("querySrv") ||
      msg.includes("_mongodb._tcp") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ENOTFOUND");

    if (isSrvDnsIssue && String(mongoUri).startsWith("mongodb+srv://")) {
      throw new Error(
        [
          "MongoDB connection failed due to SRV/DNS resolution.",
          "Fix: In MongoDB Atlas → Connect → Drivers, copy the *Standard connection string* (starts with mongodb://)",
          "and replace MONGO_URI in server/.env with that mongodb:// URI (non-SRV).",
          "",
          "Original error: " + msg,
        ].join("\n")
      );
    }

    throw err;
  }
}

module.exports = connectDB;

