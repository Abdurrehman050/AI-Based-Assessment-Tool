// controllers/adminCtrl.js
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Teacher from "../models/Teacher.js";
import Candidate from "../models/Candidate.js";
import Exam from "../models/Exam.js";
import mongoose from "mongoose";

// Generate JWT token for admin
const generateToken = (admin) =>
  jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ✅ Admin login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(admin);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.json({ admin });
});

// ✅ Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().select("-password");
  const candidates = await Candidate.find().select("-password");
  res.json({ teachers, candidates });
});

// ✅ Delete a user
export const deleteUser = asyncHandler(async (req, res) => {
  const { role, id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const model = role === "teacher" ? Teacher : Candidate;
  const user = await model.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();
  res.json({ message: `${role} deleted successfully` });
});

// ✅ Get all exams
export const getAllExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().populate("createdBy", "username email");
  res.json({ exams });
});

// ✅ Delete an exam
export const deleteExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  const exam = await Exam.findById(id);
  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  await exam.deleteOne();
  res.json({ message: "Exam deleted successfully" });
});
