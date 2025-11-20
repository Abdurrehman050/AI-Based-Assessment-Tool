// routes/teacherRouter.js
import express from "express";
import {
  registerTeacher,
  loginTeacher,
  getProfile,
  createExam,
  logoutTeacher,
} from "../controllers/teacherCtrl.js";
import isAuthenticated from "../middlewares/isAuth.js";

const teacherRouter = express.Router();

// @route   POST /api/v1/teachers/register
// @desc    Register a new teacher
// @access  Public
teacherRouter.post("/api/v1/teachers/register", registerTeacher);

// @route   POST /api/v1/teachers/login
// @desc    Login a teacher
// @access  Public
teacherRouter.post("/api/v1/teachers/login", loginTeacher);

// @route   GET /api/v1/teachers/profile
// @desc    Get teacher profile
// @access  Private
teacherRouter.get("/api/v1/teachers/profile", isAuthenticated, getProfile);

// @route   POST /api/v1/teachers/create-exam
// @desc    Create an exam using AI
// @access  Private
teacherRouter.post("/api/v1/teachers/create-exam", isAuthenticated, createExam);

// @route   POST /api/v1/teachers/logout
// @desc    Logout a teacher
// @access  Private
teacherRouter.post("/api/v1/teachers/logout", isAuthenticated, logoutTeacher);

export default teacherRouter;
