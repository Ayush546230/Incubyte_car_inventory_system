import mongoose from "mongoose";

const uri = "mongodb+srv://ayushsrivastava18623_db_user:S1qm267LBMa1A7j4@cluster0.pa3rzw8.mongodb.net/CarRental";

console.log("Attempting direct mongoose connect with 5s timeout...");
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected successfully!");
} catch (err) {
  console.error("Direct connection error:", err.message);
}
process.exit(0);
