// controllers/candidateCtrl.js
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Candidate from "../models/Candidate.js";
import Exam from "../models/Exam.js";
import ExamSubmission from "../models/ExamSubmission.js";

// ✅ Register Candidate
export const registerCandidate = asyncHandler(async (req, res) => {
  const { username, email, password, institution } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const exists = await Candidate.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Candidate already exists");
  }

  const hashed = await bcrypt.hash(password, 10);
  const candidate = await Candidate.create({
    username,
    email,
    password: hashed,
    institution,
  });

  res.status(201).json({
    message: "Candidate registered successfully",
    candidate: {
      _id: candidate._id,
      username: candidate.username,
      email: candidate.email,
    },
  });
});

// ✅ Login Candidate
export const loginCandidate = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const candidate = await Candidate.findOne({ email });
  if (!candidate) {
    res.status(404);
    throw new Error("Candidate not found");
  }

  const match = await bcrypt.compare(password, candidate.password);
  if (!match) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: candidate._id, role: "candidate" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    candidate: {
      _id: candidate._id,
      username: candidate.username,
      email: candidate.email,
    },
  });
});

// ✅ Get Candidate Profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await Candidate.findById(req.user._id)
    .populate({
      path: "attemptedExams",
      populate: { path: "exam", select: "title examKey level" },
    })
    .select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Candidate not found");
  }
  res.json({ user });
});

// ✅ Get Exam by Key
export const getExamByKey = asyncHandler(async (req, res) => {
  const { examKey } = req.params;

  const exam = await Exam.findOne({ examKey });
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }

  res.json({ exam });
});

// ✅ Submit Exam
export const submitExam = asyncHandler(async (req, res) => {
  const { examId, mcqAnswers, shortAnswers } = req.body;

  const submission = await ExamSubmission.create({
    exam: examId,
    candidate: req.user._id,
    mcqAnswers,
    shortAnswers,
    isSubmitted: true,
  });

  res.status(201).json({
    message: "Exam submitted successfully",
    submission,
  });
  await Candidate.findByIdAndUpdate(req.user._id, {
    $push: { attemptedExams: submission._id },
  });
});
