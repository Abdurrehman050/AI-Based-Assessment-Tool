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
  if (!/^[A-Za-z]/.test(String(username).trim())) {
    res.status(400);
    throw new Error("Username must start with an alphabet letter");
  }

  const teacherExists = await Teacher.findOne({ email });
  if (teacherExists) {
    res.status(400);
    throw new Error("Teacher already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const teacher = await Teacher.create({
    username: String(username).trim(),
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
    token,
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
    // Look for the first { and the last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error("AI did not return valid JSON");
    }
    const jsonString = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonString);
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

const toggleExamStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  const exam = await Exam.findOne({ _id: id, createdBy: req.user._id });

  if (!exam) return res.status(404).json({ message: "Exam not found" });

  exam.isActive = !exam.isActive;
  // If we are activating, ensure status is published
  if (exam.isActive) {
    exam.status = "published";
  }
  await exam.save();

  res.json({
    message: `Exam ${exam.isActive ? "activated" : "deactivated"}`,
    exam,
  });
});
//delete
const deleteExamController = asyncHandler(async (req, res) => {
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

  if (!exam) throw new Error("Exam not found for this submission");

  // 1️⃣ Score MCQs
  let mcqScore = 0;
  if (Array.isArray(submission.mcqAnswers) && Array.isArray(exam.questions?.mcqs)) {
    for (const ans of submission.mcqAnswers) {
      const q = exam.questions.mcqs.find(x => String(x._id) === String(ans.questionId));
      if (q && String(ans.selectedOption).trim() === String(q.answer).trim()) {
        mcqScore += 1;
      }
    }
  }

  // 2️⃣ Prepare short answers & check for exact matches
  const shortItems = [];
  let exactMatchScore = 0;

  if (Array.isArray(submission.shortAnswers) && Array.isArray(exam.questions?.shortQuestions)) {
    for (const sa of submission.shortAnswers) {
      const q = exam.questions.shortQuestions.find(x => String(x._id) === String(sa.questionId));
      if (q) {
        const studentAns = (sa.answerText || "").trim();
        const modelAns = (q.answer || "").trim();

        // 💡 FALLBACK: If exact match (case-insensitive), pre-grade it to 2 points
        if (studentAns.toLowerCase() === modelAns.toLowerCase() && studentAns !== "") {
          sa.aiScore = 2;
          sa.aiFeedback = "Exact match with model answer.";
          exactMatchScore += 2;
          console.log(`[Grading] Exact match found for question ${sa.questionId}. Awarded 2 points.`);
        } else {
          shortItems.push({
            questionId: String(sa.questionId),
            question: q.question,
            studentAnswer: studentAns,
            modelAnswer: modelAns,
          });
        }
      }
    }
  }

  console.log(`[Grading] Submission ${submission._id}: ${shortItems.length} questions remaining for AI, ${exactMatchScore} pts from exact matches.`);

  // 3️⃣ If no more questions for AI, finalize
  if (shortItems.length === 0) {
    submission.score = mcqScore + exactMatchScore;
    submission.checkedByAI = true;
    submission.isGraded = true;
    submission.gradedBy = teacherId;
    submission.markModified("shortAnswers");
    await submission.save();
    return submission;
  }

  // 4️⃣ Call AI for remaining items
  const ai = await getGeminiClient();
  const aiPrompt = `
You are an expert academic grader. Grade the following student answers against the model answers.
Each question is worth a maximum of 2 points.

SCORING CRITERIA:
- 2 points: Answer is correct and covers the essence of the model answer.
- 1 point: Answer is partially correct or shows some understanding but is incomplete.
- 0 points: Answer is incorrect, irrelevant, or empty.

Return your response ONLY as a valid JSON array of objects. Do not include markdown or explanations.
Format: [{"questionId": "...", "score": 2, "feedback": "..."}]

Input: ${JSON.stringify(shortItems, null, 2)}
`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: aiPrompt,
  });

  const text = result.text || result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("[Grading Error] AI returned empty content:", JSON.stringify(result, null, 2));
    throw new Error("Failed to read AI response text");
  }

  // 5️⃣ SAFE JSON parsing
  function parseAIJSON(raw) {
    let clean = raw.trim();
    // Try to find the array first
    let first = clean.indexOf("[");
    let last = clean.lastIndexOf("]");

    // If no array, try to find an object
    if (first === -1) {
      first = clean.indexOf("{");
      last = clean.lastIndexOf("}");
    }

    if (first === -1 || last === -1 || last < first) {
      throw new Error("AI output does not contain valid JSON brackets");
    }

    const jsonString = clean.substring(first, last + 1);
    return JSON.parse(jsonString);
  }

  let grades;
  try {
    const parsed = parseAIJSON(text);
    if (Array.isArray(parsed)) {
      grades = parsed;
    } else if (parsed && typeof parsed === "object") {
      grades = parsed.grades || parsed.results || parsed.data || [parsed];
    } else {
      grades = [];
    }
  } catch (err) {
    console.error("[Grading Error] RAW AI OUTPUT:\n", text);
    throw new Error("AI did not return valid JSON for grading");
  }

  // 6️⃣ Apply AI grades
  let aiTotalScore = 0;
  for (const g of grades) {
    const idx = submission.shortAnswers.findIndex(s => String(s.questionId) === String(g.questionId).trim());
    if (idx !== -1) {
      // Ensure score is a number and within 0-2
      let score = Number(g.score);
      if (isNaN(score)) score = 0;
      score = Math.max(0, Math.min(2, score));

      submission.shortAnswers[idx].aiScore = score;
      submission.shortAnswers[idx].aiFeedback = g.feedback || "";
      aiTotalScore += score;
    }
  }

  // 7️⃣ Finalize submission
  submission.score = mcqScore + exactMatchScore + aiTotalScore;
  submission.checkedByAI = true;
  submission.isGraded = true;
  submission.gradedBy = teacherId;
  submission.feedback = (submission.feedback || "") + "\nAI grading performed";

  submission.markModified("shortAnswers");
  await submission.save();

  console.log(`[Grading] Completed. Total Score: ${submission.score} (MCQ: ${mcqScore}, Exact: ${exactMatchScore}, AI: ${aiTotalScore})`);
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
  if (Array.isArray(shortGrades)) {
    for (const g of shortGrades) {
      const idx = submission.shortAnswers.findIndex((s) => String(s.questionId) === String(g.questionId));
      if (idx !== -1) {
        // Only update if a score was actually provided
        if (g.score !== undefined && g.score !== null) {
          const score = Number(g.score);
          submission.shortAnswers[idx].humanScore = isNaN(score) ? 0 : score;
          submission.shortAnswers[idx].humanFeedback = g.feedback || "";
        }
      }
    }
  }

  // 🔴 IMPORTANT: Tell Mongoose the nested array changed
  submission.markModified("shortAnswers");

  // compute MCQ score
  let mcqScore = 0;
  if (Array.isArray(submission.mcqAnswers) && Array.isArray(exam.questions?.mcqs)) {
    for (const ans of submission.mcqAnswers) {
      const q = exam.questions.mcqs.find((x) => String(x._id) === String(ans.questionId));
      if (q && String(ans.selectedOption).trim() === String(q.answer).trim()) {
        mcqScore += 1;
      }
    }
  }

  // compute short score: prefer humanScore if provided, else aiScore
  let shortScore = 0;
  for (const s of submission.shortAnswers) {
    if (typeof s.humanScore === "number" && s.humanScore !== null) {
      shortScore += s.humanScore;
    } else if (typeof s.aiScore === "number" && s.aiScore !== null) {
      shortScore += s.aiScore;
    }
  }

  submission.score = mcqScore + shortScore;
  submission.isGraded = true;
  submission.gradedBy = req.user._id;
  submission.feedback = (submission.feedback || "") + `\nManual update at ${new Date().toLocaleString()}`;
  
  await submission.save();

  console.log(`[Manual Grading] Saved. Total: ${submission.score} (MCQ: ${mcqScore}, Short: ${shortScore})`);
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
  const attemptedCount = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.isGraded);
  const gradedCount = gradedSubmissions.length;
  const averageScore =
    attemptedCount > 0
      ? submissions.reduce((acc, s) => acc + (Number(s.score) || 0), 0) /
      attemptedCount
      : 0;

  const totalMarks =
    (Array.isArray(exam.questions?.mcqs) ? exam.questions.mcqs.length : 0) * 1 +
    (Array.isArray(exam.questions?.shortQuestions)
      ? exam.questions.shortQuestions.length
      : 0) *
    2;

  res.json({
    examId,
    exam: {
      _id: exam._id,
      title: exam.title,
      examKey: exam.examKey,
      level: exam.level,
      duration: exam.duration,
      status: exam.status,
      isActive: exam.isActive,
      numMcqs: Array.isArray(exam.questions?.mcqs) ? exam.questions.mcqs.length : 0,
      numShorts: Array.isArray(exam.questions?.shortQuestions)
        ? exam.questions.shortQuestions.length
        : 0,
      totalMarks,
    },
    stats: {
      attemptedCount,
      gradedCount,
      averageScore,
    },
    submissions,
  });
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
        level: exam.level,
        duration: exam.duration,
        numMcqs: exam.numMcqs,
        numShorts: exam.numShorts,
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


export { registerTeacher, loginTeacher, getProfile, createExam, logoutTeacher, gradeSubmissionAI, gradeExamSubmissionsAI, gradeSubmissionManual, getExamSubmissions, getExamReports, getSubmissionReports, getExamPreview, approveExam, toggleExamStatus, deleteExamController };
