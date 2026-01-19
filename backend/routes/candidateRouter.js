// // routes/candidateRouter.js
// import express from "express";
// import {
//   registerCandidate,
//   loginCandidate,
//   getProfile,
//   getExamByKey,
//   submitExam,
//   getSubmissionById,
//   enterExamByKey,
//   getExamById,
//   getExamInstructions,
//   logout
// } from "../controllers/candidateCtrl.js";
// import isAuth from "../middlewares/isAuth.js";

// const router = express.Router();

// router.post("/register", registerCandidate);
// router.post("/login", loginCandidate);
// router.get("/profile", isAuth, getProfile);
// router.get("/exam/:examKey", isAuth, getExamByKey);
// router.post("/submit-exam", isAuth, submitExam);
// router.get("/submissions/:id", isAuth, getSubmissionById);
// // router.get("/exams/:id", isAuth, getExamById);
// router.get("/exams/:id/instructions", isAuth, getExamInstructions);


// router.post("/logout", logout);
// router.post(
//   "/enter-exam",
//   isAuth,
//   enterExamByKey
// );



// export default router;
import express from "express";
import {
  registerCandidate,
  loginCandidate,
  getProfile,
  submitExam,
  getSubmissionById,
  enterExamByKey,
  getExamById,
  getExamInstructions,
  logout
} from "../controllers/candidateCtrl.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Auth
router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.post("/logout", logout);

// Candidate
router.get("/profile", isAuth, getProfile);

// Exam entry (BY KEY)
router.post("/enter-exam", isAuth, enterExamByKey);

// Instructions (BY ID)
router.get(
  "/exam/:examId/instructions",
  isAuth,
  getExamInstructions
);

// Actual exam paper (BY ID)
router.get(
  "/exam/:examId",
  isAuth,
  getExamById
);

// Submission
router.post("/submit-exam", isAuth, submitExam);
router.get("/submissions/:id", isAuth, getSubmissionById);

export default router;
