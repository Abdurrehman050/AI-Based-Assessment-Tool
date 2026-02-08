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
import mongoose from "mongoose";

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
    message: "Teacher registered successfully.",
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
    sameSite: "lax",
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

  const {
    title,
    level,
    questionType,
    duration,
    numMcqs,
    numShorts,
    prompt,
  } = req.body;
  if (!duration || duration < 10) {
    return res.status(400).json({
      message: "Exam duration must be at least 10 minutes",
    });
  }
  if (!title || !level || !duration || !questionType || !prompt) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const aiPrompt = `
                    You are an intelligent exam generator.
                    Return only pure JSON — do not include text before or after it.
                    Create an exam for the topic: "${title}".
                    Difficulty level: ${level}.
                    Question type: ${questionType}.
                    Include ${numMcqs || 0} multiple-choice questions (MCQs) and ${numShorts || 0
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

  function extractJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI did not return valid JSON");
    }
    return JSON.parse(match[0]);
  }

  let generatedExam;
  try {
    generatedExam = extractJSON(text);
  } catch (err) {
    console.error("RAW AI OUTPUT:\n", text);
    throw new Error("AI did not return valid JSON");
  }


  const examKey = await generateExamKey(); // ✅ remember to await this since it's async

  const exam = await Exam.create({
    title,
    level,
    questionType,
    duration,
    numMcqs,
    numShorts,
    examKey,
    questions: generatedExam,
    createdBy: req.user._id,
    status: "draft"    // 🔴 not visible to students

  });
  await Teacher.findByIdAndUpdate(req.user._id, {
    $push: { exams: exam._id },
  });
  res.status(201).json({
    message: "Exam generated successfully",
    examKey: exam.examKey,
    exam,
  });
});
const getExamPreview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  // Correct query: use _id instead of exam_id
  const exam = await Exam.findOne({ _id: id, createdBy: req.user._id });

  if (!exam) return res.status(404).json({ message: "Exam not found" });

  res.json({ exam });  // ✅ send exam in object
});
const approveExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  const exam = await Exam.findOne({ _id: id, createdBy: req.user._id });

  if (!exam) return res.status(404).json({ message: "Exam not found" });

  exam.status = "published";
  exam.isActive = true;
  await exam.save();

  res.json({ message: "Exam approved and active", exam });
});
//delete
export const deleteExamController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  // 1️⃣ Make sure the teacher owns this exam
  const exam = await Exam.findOne({ _id: id, createdBy: req.user._id });
  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // 2️⃣ Delete all submissions related to this exam
  await ExamSubmission.deleteMany({ exam: id });

  // 3️⃣ Remove this exam from candidates' attemptedExams
  await Candidate.updateMany(
    { attemptedExams: id },
    { $pull: { attemptedExams: id } }
  );

  // 4️⃣ Delete the exam itself
  await Exam.deleteOne({ _id: id });

  res.json({ message: "Exam and all related data deleted successfully" });
});



// Internal helper: grade a submission document using Gemini and save it
async function doGradeSubmission(submission, teacherId) {
  const exam = submission.exam && submission.exam.questions
    ? submission.exam
    : await Exam.findById(submission.exam);

  // 1️⃣ Score MCQs
  let mcqScore = 0;
  if (Array.isArray(submission.mcqAnswers) && Array.isArray(exam.questions?.mcqs)) {
    for (const ans of submission.mcqAnswers) {
      const q = exam.questions.mcqs.find(x => String(x._id) === String(ans.questionId));
      if (q && ans.selectedOption === q.answer) mcqScore += 1;
    }
  }

  // 2️⃣ Prepare short answers
  const shortItems = [];
  if (Array.isArray(submission.shortAnswers) && Array.isArray(exam.questions?.shortQuestions)) {
    for (const sa of submission.shortAnswers) {
      const q = exam.questions.shortQuestions.find(x => String(x._id) === String(sa.questionId));
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

  // 3️⃣ If no short answers, finalize
  if (shortItems.length === 0) {
    submission.score = mcqScore;
    submission.checkedByAI = true;
    submission.isGraded = true;
    submission.gradedBy = teacherId;
    await submission.save();
    return submission;
  }

  // 4️⃣ Call AI
  const ai = await getGeminiClient();
  const aiPrompt = `
You are an expert grader. Grade each short answer against the model answer.
Each question is worth 1 point. Return ONLY a valid JSON array.
No explanations or text outside JSON.

Example: [{"questionId":"...","score":1,"feedback":"Good answer"}]

Input: ${JSON.stringify(shortItems, null, 2)}
`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: aiPrompt
  });

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Failed to read AI response text");

  // 5️⃣ SAFE JSON parsing
  function parseAIJSON(raw) {
    let clean = raw.trim();
    // Remove ```json or ``` blocks
    if (clean.startsWith("```")) {
      clean = clean.replace(/```json?/, "").replace(/```$/, "").trim();
    }
    // Extract first array from text
    const match = clean.match(/\[.*\]/s);
    if (!match) throw new Error("AI did not return valid JSON");
    return JSON.parse(match[0]);
  }

  let grades;
  try {
    grades = parseAIJSON(text);
  } catch (err) {
    console.error("RAW AI OUTPUT:\n", text);
    throw new Error("AI did not return valid JSON for grading");
  }

  // 6️⃣ Apply grades
  let shortScore = 0;
  for (const g of grades) {
    const idx = submission.shortAnswers.findIndex(s => String(s.questionId) === String(g.questionId));
    if (idx !== -1) {
      const score = typeof g.score === "number" ? g.score : Number(g.score) || 0;
      submission.shortAnswers[idx].aiScore = score;
      submission.shortAnswers[idx].aiFeedback = g.feedback || "";
      shortScore += score;
    }
  }

  // 7️⃣ Finalize submission
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

// @desc    Reports: exam-level stats and filtering
// @route   GET /api/v1/teachers/reports/exams
// @access  Private (teacher)
const getExamReports = asyncHandler(async (req, res) => {
  // fetch all exams by this teacher
  const exams = await Exam.find({ createdBy: req.user._id });

  const reports = await Promise.all(
    exams.map(async (exam) => {
      const submissions = await ExamSubmission.find({ exam: exam._id });
      const gradedSubmissions = submissions.filter((s) => s.isGraded);

      // calculate average score
      const avgScore =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((acc, s) => acc + s.score, 0) /
          gradedSubmissions.length
          : 0;

      const totalMarks =
        (exam.numMcqs || 0) * 1 + (exam.numShorts || 0) * 2; // adjust as per your scoring

      return {
        _id: exam._id,
        title: exam.title,
        examKey: exam.examKey,
        isActive: exam.isActive,
        attemptedCount: submissions.length,
        gradedCount: gradedSubmissions.length,
        averageScore: avgScore,
        totalMarks,
      };
    }),
  );

  res.status(200).json({ success: true, data: reports });
});

// @desc    Reports: submission-level filtering
// @route   GET /api/v1/teachers/reports/submissions
// @access  Private (teacher)
const getSubmissionReports = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "teacher") {
    res.status(403);
    throw new Error("Only teachers can view reports");
  }

  const { examId, from, to, isGraded, minScore, maxScore, candidateId, page = 1, limit = 20 } = req.query;
  const query = {};
  if (examId) query.exam = new mongoose.Types.ObjectId(examId);
  if (candidateId) query.candidate = new mongoose.Types.ObjectId(candidateId);
  if (isGraded === 'true') query.isGraded = true;
  if (isGraded === 'false') query.isGraded = false;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  if (minScore) query.score = query.score || {}, query.score.$gte = Number(minScore);
  if (maxScore) query.score = query.score || {}, query.score.$lte = Number(maxScore);

  // Ensure teacher only sees submissions for their exams
  const teacherExamIds = await Exam.find({ createdBy: req.user._id }).select('_id').lean();
  const examIds = teacherExamIds.map(e => String(e._id));
  if (examId) {
    if (!examIds.includes(String(examId))) {
      res.status(403);
      throw new Error('Not authorized to view submissions for this exam');
    }
  } else {
    query.exam = { $in: teacherExamIds.map(e => e._id) };
  }

  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));

  const submissions = await ExamSubmission.find(query)
    .populate('candidate', 'username email')
    .populate('exam', 'title examKey')
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l)
    .lean();

  const total = await ExamSubmission.countDocuments(query);
  res.json({ total, page: p, limit: l, submissions });
});


export { registerTeacher, loginTeacher, getProfile, createExam, logoutTeacher, gradeSubmissionAI, gradeExamSubmissionsAI, gradeSubmissionManual, getExamSubmissions, getExamReports, getSubmissionReports, getExamPreview, approveExam };
