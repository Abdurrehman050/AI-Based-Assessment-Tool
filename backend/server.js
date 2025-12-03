// server.js
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import teacherRouter from "./routes/teacherRouter.js";
import candidateRouter from "./routes/candidateRouter.js";

dotenv.config();

//! Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

const app = express();

//! Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true, // allows cookies
  })
);

//! Routes

app.use("/api/v1/candidates", candidateRouter);
app.use("/api/v1/teachers", teacherRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
