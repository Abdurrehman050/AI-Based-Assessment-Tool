// middlewares/isAuth.js
import jwt from "jsonwebtoken";
import Candidate from "../models/Candidate.js";
import Teacher from "../models/Teacher.js";
import asyncHandler from "express-async-handler";

const isAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mySecretKey");

    if (decoded.role === "teacher") {
      req.user = await Teacher.findById(decoded.id).select("-password");
    } else if (decoded.role === "candidate") {
      req.user = await Candidate.findById(decoded.id).select("-password");
    }

    if (!req.user) {
      res.status(404);
      throw new Error("User not found");
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401);
    throw new Error("Invalid or expired token");
  }
});

export default isAuth;
