// controllers/teacherCtrl.js
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
//import { GoogleGenerativeAI } from "@google/genai";
import Teacher from "../models/Teacher.js";
import Exam from "../models/Exam.js";
import generateExamKey from "../utils/generateExamKey.js";

// @desc    Register teacher
// @route   POST /api/v1/teachers/register
// @access  Public
const registerTeacher = asyncHandler(async (req, res) => {
  const { username, email, password, subject } = req.body;

  if (!username || !email || !password || !subject) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const teacherExists = await Teacher.findOne({ email });
  if (teacherExists) {
    res.status(400);
    throw new Error("Teacher already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const teacher = await Teacher.create({
    username,
    email,
    password: hashedPassword,
    subject,
  });

  res.status(201).json({
    message: "user created successfully",
    _id: teacher._id,
    username: teacher.username,
    email: teacher.email,
    subject: teacher.subject,
  });
});

// @desc    Login teacher
// @route   POST /api/v1/teachers/login
// @access  Public
const loginTeacher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const teacher = await Teacher.findOne({ email });
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Generate JWT
  const token = jwt.sign(
    { id: teacher._id, role: "teacher" },
    process.env.JWT_SECRET || "mySecretKey",
    { expiresIn: "7d" }
  );

  // Store token in HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // true on https
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    message: "Login successful",
    teacher: {
      _id: teacher._id,
      username: teacher.username,
      email: teacher.email,
      institution: teacher.institution,
      subject: teacher.subject,
    },
  });
});

// @desc    Get teacher profile
// @route   GET /api/v1/teachers/profile
// @access  Private
//! Profile
const getProfile = asyncHandler(async (req, res) => {
  //! Find the user
  const user = await Teacher.findById(req.user._id)
    .populate("exams")
    .select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  //! Send the response
  res.json({ user });
});
// Dynamic import for ESM module
async function getGeminiClient() {
  const aiModule = await import("../utils/geminiClient.mjs");
  return aiModule.default;
}

// Example usage inside your createExam controller
const createExam = asyncHandler(async (req, res) => {
  const ai = await getGeminiClient(); // 👈 load Gemini dynamically

  const { title, level, questionType, numMcqs, numShorts, prompt } = req.body;

  if (!title || !level || !questionType || !prompt) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const aiPrompt = `
You are an intelligent exam generator.
Return only pure JSON — do not include text before or after it.
Create an exam for the topic: "${title}".
Difficulty level: ${level}.
Question type: ${questionType}.
Include ${numMcqs || 0} multiple-choice questions (MCQs) and ${
    numShorts || 0
  } short-answer questions.
Focus area: ${prompt}.

Return your response strictly in valid JSON format (no markdown, no explanations).
The structure must be:

{
  "mcqs": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "string"
    }
  ],
  "shortQuestions": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}
`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: aiPrompt,
  });

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error("Unexpected Gemini response:", result);
    throw new Error("Failed to read AI response text");
  }

  let generatedExam;
  try {
    generatedExam = JSON.parse(text);
  } catch (err) {
    console.error("Invalid JSON:", text);
    throw new Error("AI did not return valid JSON");
  }

  const examKey = await generateExamKey(); // ✅ remember to await this since it's async

  const exam = await Exam.create({
    title,
    level,
    questionType,
    numMcqs,
    numShorts,
    examKey,
    questions: generatedExam,
    createdBy: req.user._id,
  });
  await Teacher.findByIdAndUpdate(req.user._id, {
    $push: { exams: exam._id },
  });
  res.status(201).json({
    message: "Exam generated successfully",
    examKey,
    exam,
  });
});

// @desc    Logout teacher
// @route   POST /api/v1/teachers/logout
// @access  Private
const logoutTeacher = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export { registerTeacher, loginTeacher, getProfile, createExam, logoutTeacher };
