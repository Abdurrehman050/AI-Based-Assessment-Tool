import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import asyncHandler from "express-async-handler";

const isAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized as admin");
    }

    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      res.status(404);
      throw new Error("Admin not found");
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401);
    throw new Error("Invalid or expired token");
  }
});

export default isAdmin;
