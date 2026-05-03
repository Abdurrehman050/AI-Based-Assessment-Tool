// controllers/candidateCtrl.js
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Candidate from "../models/Candidate.js";
import mongoose from "mongoose";

import Exam from "../models/Exam.js";
import ExamSubmission from "../models/ExamSubmission.js";


// Helper: extract candidate answers from a provided exam object
export function extractAnswersFromExam(exam) {
  const mcqAnswers = [];
  const shortAnswers = [];
  if (!exam || !exam.questions) return { mcqAnswers, shortAnswers };

  const { mcqs = [], shortQuestions = [] } = exam.questions;

  if (Array.isArray(mcqs)) {
    for (const q of mcqs) {
      const sel = q.selectedOption ?? q.selected ?? q.response ?? q.choice ?? q.selectedAnswer ?? q.studentAnswer;
      if (sel !== undefined && sel !== null) {
        mcqAnswers.push({ questionId: q._id || q.id, selectedOption: sel });
      }
    }
  }

  if (Array.isArray(shortQuestions)) {
    for (const q of shortQuestions) {
      const txt = q.answerText ?? q.studentAnswer ?? q.response ?? q.responseText ?? q.selectedAnswer ?? q.student_answer;
      if (txt !== undefined && txt !== null) {
        shortAnswers.push({ questionId: q._id || q.id, answerText: txt });
      }
    }
  }

  return { mcqAnswers, shortAnswers };
}

function normalizeQuestionId(value) {
  if (!value) return null;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
}

function buildAnswerMaps(mcqAnswers = [], shortAnswers = []) {
  const mcqMap = new Map();
  const shortMap = new Map();

  for (const item of mcqAnswers) {
    const id = normalizeQuestionId(item?.questionId);
    if (!id) continue;
    mcqMap.set(id, item?.selectedOption ?? "");
  }

  for (const item of shortAnswers) {
    const id = normalizeQuestionId(item?.questionId);
    if (!id) continue;
    shortMap.set(id, item?.answerText ?? "");
  }

  return { mcqMap, shortMap };
}

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
    secure: process.env.NODE_ENV === "production", // use false for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    token,
    candidate: {
      _id: candidate._id,
      username: candidate.username,
      email: candidate.email,
    },
  });
});

// ✅ Logout Candidate
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
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
  const { examId, exam, mcqAnswers, shortAnswers, warningLogs, autoSubmitted } =
    req.body;

  // Accept either examId or an exam object containing _id
  const id = examId || (exam && (exam._id || exam.id));
  if (!id) {
    res.status(400);
    throw new Error("`examId` or `exam._id` is required in request body");
  }

  // ensure the exam exists
  const examExists = await Exam.findById(id);
  if (!examExists) {
    res.status(404);
    throw new Error("Exam not found");
  }

  let mcqList = Array.isArray(mcqAnswers) ? mcqAnswers : [];
  let shortList = Array.isArray(shortAnswers) ? shortAnswers : [];

  // Try to extract answers from a full `exam` object if provided
  if ((mcqList.length === 0 || shortList.length === 0) && exam) {
    const extracted = extractAnswersFromExam(exam);
    if (mcqList.length === 0 && Array.isArray(extracted.mcqAnswers) && extracted.mcqAnswers.length) {
      mcqList = extracted.mcqAnswers;
    }
    if (shortList.length === 0 && Array.isArray(extracted.shortAnswers) && extracted.shortAnswers.length) {
      shortList = extracted.shortAnswers;
    }
  }

  // If no answers were provided, log the incoming body for debugging and return a clear error
  // if (mcqList.length === 0 && shortList.length === 0) {
  //   console.warn("submitExam called with no answers. Request body:", JSON.stringify(req.body));
  //   res.status(400);
  //   throw new Error(
  //     "No answers provided. Please include `mcqAnswers` and/or `shortAnswers` arrays in the request body."
  //   );
  // }

  const { mcqMap, shortMap } = buildAnswerMaps(mcqList, shortList);
  const normalizedMcqAnswers = (examExists.questions?.mcqs || []).map((q) => ({
    questionId: q._id,
    selectedOption: mcqMap.get(String(q._id)) ?? "",
  }));
  const normalizedShortAnswers = (examExists.questions?.shortQuestions || []).map(
    (q) => ({
      questionId: q._id,
      answerText: shortMap.get(String(q._id)) ?? "",
    }),
  );
  const normalizedWarningLogs = Array.isArray(warningLogs)
    ? warningLogs
        .filter((log) => log && typeof log.message === "string")
        .map((log) => ({
          event: typeof log.event === "string" ? log.event : "violation",
          message: log.message.trim(),
          occurredAt:
            log.occurredAt && !Number.isNaN(new Date(log.occurredAt).getTime())
              ? new Date(log.occurredAt)
              : new Date(),
        }))
        .filter((log) => Boolean(log.message))
    : [];

  const submission = await ExamSubmission.create({
    exam: id,
    candidate: req.user._id,
    mcqAnswers: normalizedMcqAnswers,
    shortAnswers: normalizedShortAnswers,
    warningLogs: normalizedWarningLogs,
    totalViolations: normalizedWarningLogs.length,
    autoSubmitted: Boolean(autoSubmitted),
    isSubmitted: true,
  });

  await Candidate.findByIdAndUpdate(req.user._id, {
    $push: { attemptedExams: submission._id },
  });

  res.status(201).json({
    message: "Exam submitted successfully",
    submission,
  });


});

// @desc    Get a submission by ID (candidate or teacher)
// @route   GET /api/v1/candidates/submissions/:id
// @access  Private (candidate or teacher)
export const getSubmissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const submission = await ExamSubmission.findById(id)
    .populate("candidate", "username email")
    .populate({
      path: "exam",
      select: "title duration questions createdBy",
    });

  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  const isCandidate = req.user.role === "candidate";
  const isTeacher = req.user.role === "teacher";
  const isOwner =
    String(submission.candidate._id) === String(req.user._id);

  if (isCandidate && !isOwner) {
    res.status(403);
    throw new Error("Not authorized");
  }
  if (
    isTeacher &&
    String(submission.exam?.createdBy) !== String(req.user._id)
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  let responseSubmission = submission.toObject();

  // 🔐 HIDE SCORES IF NOT GRADED (CANDIDATE)
  if (isCandidate && !submission.checkedByAI) {
    responseSubmission.mcqAnswers = responseSubmission.mcqAnswers.map(a => ({
      questionId: a.questionId,
      selectedOption: a.selectedOption,
    }));

    responseSubmission.shortAnswers = responseSubmission.shortAnswers.map(a => ({
      questionId: a.questionId,
      answerText: a.answerText,
    }));

    delete responseSubmission.aiFeedback;
    delete responseSubmission.humanFeedback;
  }

  res.json({ submission: responseSubmission });
});




//enter exam by key
export const enterExamByKey = asyncHandler(async (req, res) => {
  const { examKey } = req.body;

  // Find exam by key
  const exam = await Exam.findOne({ examKey });
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  // Check if exam is active
  if (!exam.isActive || exam.status !== "published") {
    return res.status(403).json({ message: "Exam is inactive or not published" });
  }

  // Optionally, check if candidate already attempted
  const candidate = await Candidate.findById(req.user._id).populate('attemptedExams');

  const alreadyAttempted = candidate.attemptedExams?.some(
    (sub) => {
      // If attemptedExams are populated ExamSubmissions
      if (sub.exam) return String(sub.exam) === String(exam._id);
      // If attemptedExams are just ObjectIds (not populated)
      return String(sub) === String(exam._id);
    }
  );

  if (alreadyAttempted) {
    return res.status(400).json({ message: "You have already attempted this exam" });
  }


  // Return exam details (without answers)
  res.json({
    examId: exam._id,
    exam: {
      title: exam.title,
      level: exam.level,
      questions: exam.questions,
      numMcqs: exam.numMcqs,
      numShorts: exam.numShorts,
    },
  });
});
// controllers/candidateCtrl.js
export const getExamById = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);

  if (!exam || exam.status !== "published") {
    return res.status(403).json({ message: "Exam is not available" });
  }

  res.json({ exam });
});
export const getExamInstructions = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  const exam = await Exam.findById(examId).select(
    "title duration questions status isActive"
  );

  if (!exam || exam.status !== "published" || !exam.isActive) {
    return res.status(403).json({ message: "Exam is not available" });
  }

  // ✅ count from nested arrays
  const numMcqs = Array.isArray(exam.questions?.mcqs)
    ? exam.questions.mcqs.length
    : 0;

  const numShorts = Array.isArray(exam.questions?.shortQuestions)
    ? exam.questions.shortQuestions.length
    : 0;

  res.json({
    exam: {
      _id: exam._id,
      title: exam.title,
      duration: exam.duration,
      numMcqs,
      numShorts,
    },
  });
});

// GET /api/v1/candidates/submissions
export const getCandidateSubmissions = asyncHandler(async (req, res) => {
  const candidateId = req.user._id; // set by isAuth middleware

  if (!candidateId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const submissions = await ExamSubmission.find({ candidate: candidateId })
    .populate("exam", "title duration status questions")
    .sort({ createdAt: -1 });

  console.log("Submissions found:", submissions);

  res.json({ submissions });
});
