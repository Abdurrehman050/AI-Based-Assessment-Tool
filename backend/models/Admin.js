import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;


const adminSchema = new Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("Admin", adminSchema);
