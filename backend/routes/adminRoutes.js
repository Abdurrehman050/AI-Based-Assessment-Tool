// routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  getAllUsers,
  deleteUser,
  getAllExams,
  deleteExam,
} from "../controllers/adminCtrl.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// Public route
router.post("/login", adminLogin);

// Protected routes
router.get("/users", isAdmin, getAllUsers);
router.delete("/users/:role/:id", isAdmin, deleteUser);
router.get("/exams", isAdmin, getAllExams);
router.delete("/exams/:id", isAdmin, deleteExam);
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
