// middlewares/isAuth.js
import jwt from "jsonwebtoken";
import Candidate from "../models/Candidate.js";
import Teacher from "../models/Teacher.js";

import asyncHandler from "express-async-handler";

const isAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from cookie or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mySecretKey");

    // Fetch user based on role
    if (decoded.role === "teacher") {
      req.user = await Teacher.findById(decoded.id).select("-password");
    } else if (decoded.role === "candidate") {
      req.user = await Candidate.findById(decoded.id).select("-password");
    } else {
      return res.status(401).json({ message: "Invalid user role" });
    }

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default isAuth;
