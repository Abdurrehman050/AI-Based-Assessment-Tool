// controllers/teacherCtrl.js
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
//import { GoogleGenerativeAI } from "@google/genai";
import Teacher from "../models/Teacher.js";
import Exam from "../models/Exam.js";
import ExamSubmission from "../models/ExamSubmission.js";
import generateExamKey from "../utils/generateExamKey.js";
import Candidate from "../models/Candidate.js";

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

// Internal helper: grade a submission document using Gemini and save it
async function doGradeSubmission(submission, teacherId) {
  // ensure exam is populated
  const exam = submission.exam && submission.exam.questions ? submission.exam : await Exam.findById(submission.exam);

  // score MCQs (1 point each)
  let mcqScore = 0;
  if (Array.isArray(submission.mcqAnswers) && Array.isArray(exam.questions?.mcqs)) {
    for (const ans of submission.mcqAnswers) {
      const q = exam.questions.mcqs.find((x) => String(x._id) === String(ans.questionId));
      if (q && ans.selectedOption === q.answer) mcqScore += 1;
    }
  }

  // prepare short answers for AI grading
  const shortItems = [];
  if (Array.isArray(submission.shortAnswers) && Array.isArray(exam.questions?.shortQuestions)) {
    for (const sa of submission.shortAnswers) {
      const q = exam.questions.shortQuestions.find((x) => String(x._id) === String(sa.questionId));
      if (q) {
        shortItems.push({
          questionId: String(sa.questionId),
          question: q.question,
          studentAnswer: sa.answerText || "",
          modelAnswer: q.answer || "",
        });
      }
    }
  }

  // If no short answers, finalize score
  if (shortItems.length === 0) {
    submission.score = mcqScore;
    submission.checkedByAI = true;
    submission.isGraded = true;
    submission.gradedBy = teacherId;
    await submission.save();
    return submission;
  }

  const ai = await getGeminiClient();
  const aiPrompt = `You are an expert grader. Grade each short answer against the model answer. Each question is worth 1 point. Return ONLY valid JSON (no commentary) as an array of objects with keys: questionId (string), score (0 or 1), feedback (string). Example: [{"questionId":"...","score":1,"feedback":"Good answer"}].\n\nInput:\n${JSON.stringify(shortItems, null, 2)}`;

  const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: aiPrompt });
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Failed to read AI response text");
  }

  let grades;
  try {
    grades = JSON.parse(text);
  } catch (err) {
    throw new Error("AI did not return valid JSON for grading");
  }

  let shortScore = 0;
  for (const g of grades) {
    const idx = submission.shortAnswers.findIndex((s) => String(s.questionId) === String(g.questionId));
    if (idx !== -1) {
      const score = typeof g.score === "number" ? g.score : Number(g.score) || 0;
      submission.shortAnswers[idx].aiScore = score;
      submission.shortAnswers[idx].aiFeedback = g.feedback || "";
      shortScore += score;
    }
  }

  submission.score = mcqScore + shortScore;
  submission.checkedByAI = true;
  submission.isGraded = true;
  submission.gradedBy = teacherId;
  submission.feedback = (submission.feedback || "") + "\nAI grading performed";
  await submission.save();
  return submission;
}

// @desc    Grade a single submission using AI (teacher-triggered)
// @route   POST /api/v1/teachers/submissions/:id/grade-ai
// @access  Private (teacher)
const gradeSubmissionAI = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can grade submissions");
  }

  const submissionId = req.params.id;
  const submission = await ExamSubmission.findById(submissionId).populate("exam");
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  const exam = submission.exam;
  // ensure teacher owns the exam
  if (!exam || String(exam.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to grade this submission");
  }

  // delegate to helper that performs grading and saves
  const graded = await doGradeSubmission(submission, req.user._id);
  res.json({ message: "Submission graded by AI", submission: graded });
});

// @desc    Grade all ungraded submissions for an exam using AI
// @route   POST /api/v1/teachers/exams/:examId/grade-ai
// @access  Private (teacher)
const gradeExamSubmissionsAI = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can grade submissions");
  }

  const examId = req.params.examId;
  const exam = await Exam.findById(examId);
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  if (String(exam.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to grade this exam's submissions");
  }

  const submissions = await ExamSubmission.find({ exam: examId, isGraded: false });
  const results = [];
  for (const s of submissions) {
    try {
      const populated = await ExamSubmission.findById(s._id).populate("exam");
      // eslint-disable-next-line no-await-in-loop
      const graded = await doGradeSubmission(populated, req.user._id);
      results.push({ submissionId: s._id, status: "graded", score: graded.score });
    } catch (err) {
      results.push({ submissionId: s._id, status: "error", error: err.message });
    }
  }

  res.json({ message: 'Bulk grading complete', results });
});

// @desc    Logout teacher
// @route   POST /api/v1/teachers/logout
// @access  Private
const logoutTeacher = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// @desc    Manually grade a submission (teacher-triggered)
// @route   POST /api/v1/teachers/submissions/:id/grade-manual
// @access  Private (teacher)
const gradeSubmissionManual = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can grade submissions");
  }

  const submissionId = req.params.id;
  const { shortAnswers: shortGrades } = req.body; // expected [{ questionId, score, feedback }]

  const submission = await ExamSubmission.findById(submissionId).populate("exam");
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  const exam = submission.exam;
  if (!exam || String(exam.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to grade this submission");
  }

  // Apply human grades
  let shortScore = 0;
  if (Array.isArray(shortGrades)) {
    for (const g of shortGrades) {
      const idx = submission.shortAnswers.findIndex((s) => String(s.questionId) === String(g.questionId));
      if (idx !== -1) {
        const score = typeof g.score === "number" ? g.score : Number(g.score) || 0;
        submission.shortAnswers[idx].humanScore = score;
        submission.shortAnswers[idx].humanFeedback = g.feedback || "";
      }
    }
  }

  // compute MCQ score
  let mcqScore = 0;
  if (Array.isArray(submission.mcqAnswers) && Array.isArray(exam.questions?.mcqs)) {
    for (const ans of submission.mcqAnswers) {
      const q = exam.questions.mcqs.find((x) => String(x._id) === String(ans.questionId));
      if (q && ans.selectedOption === q.answer) mcqScore += 1;
    }
  }

  // compute short score: prefer humanScore if provided, else aiScore
  for (const s of submission.shortAnswers) {
    if (typeof s.humanScore === "number") shortScore += s.humanScore;
    else if (typeof s.aiScore === "number") shortScore += s.aiScore;
  }

  submission.score = mcqScore + shortScore;
  submission.checkedByAI = submission.checkedByAI || false;
  submission.isGraded = true;
  submission.gradedBy = req.user._id;
  submission.feedback = (submission.feedback || "") + "\nManually graded by teacher";
  await submission.save();

  res.json({ message: "Submission manually graded", submission });
});

// @desc    Get all submissions for an exam (teacher view)
// @route   GET /api/v1/teachers/exams/:examId/submissions
// @access  Private (teacher)
const getExamSubmissions = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can view submissions");
  }

  const examId = req.params.examId;
  const exam = await Exam.findById(examId);
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  if (String(exam.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to view this exam's submissions");
  }

  const submissions = await ExamSubmission.find({ exam: examId }).populate("candidate", "username email").sort({ createdAt: -1 });
  res.json({ examId, submissions });
});

export { registerTeacher, loginTeacher, getProfile, createExam, logoutTeacher, gradeSubmissionAI, gradeExamSubmissionsAI, gradeSubmissionManual, getExamSubmissions };
