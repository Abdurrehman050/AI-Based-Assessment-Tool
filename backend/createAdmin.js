import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();                 // 👈 REQUIRED — loads .env variables

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

await mongoose.connect(uri);

const admin = await Admin.create({
  username: "Super Admin",
  email: "admin@system.com",
  password: "admin123",
});

console.log("✅ Admin created:", admin.email);
process.exit();
