import mongoose from "mongoose";
import dns from "node:dns";

// Use resilient DNS servers (Cloudflare + Google)
try {
  dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8"]);
} catch (e) { /* ignore */ }

const SRV_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ayushsrivastava18623_db_user:S1qm267LBMa1A7j4@cluster0.pa3rzw8.mongodb.net/CarRental";

// Direct replica-set fallback (bypasses SRV DNS lookup entirely)
const DIRECT_URI =
  "mongodb://ayushsrivastava18623_db_user:S1qm267LBMa1A7j4@" +
  "ac-h6ti7i1-shard-00-00.pa3rzw8.mongodb.net:27017," +
  "ac-h6ti7i1-shard-00-01.pa3rzw8.mongodb.net:27017," +
  "ac-h6ti7i1-shard-00-02.pa3rzw8.mongodb.net:27017" +
  "/CarRental?ssl=true&replicaSet=atlas-ujasgl-shard-0&authSource=admin";

const CONNECT_OPTS = { serverSelectionTimeoutMS: 8000 };

export const connectDB = async () => {
  // 1️⃣ Try SRV first
  try {
    await mongoose.connect(SRV_URI, CONNECT_OPTS);
    console.log("✅  Database connected (SRV)");
    return;
  } catch (err) {
    console.warn("⚠️  SRV connection failed:", err.message);
    console.log("   Trying direct replica-set fallback…");
  }

  // 2️⃣ Fallback: direct hosts (no SRV lookup needed)
  try {
    await mongoose.connect(DIRECT_URI, CONNECT_OPTS);
    console.log("✅  Database connected (direct replica-set)");
  } catch (err2) {
    console.error("❌  Database connection failed entirely:", err2.message);
  }
};
