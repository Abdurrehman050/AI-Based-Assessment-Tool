// utils/generateExamKey.js
import crypto from "crypto";
import Exam from "../models/Exam.js";

/**
 * Generate a unique exam key like: EXAM-4F3A9C2B1D
 * Attempts several times to avoid collisions in DB.
 * @param {number} [attempts=5] max attempts before throwing
 * @returns {Promise<string>} unique examKey
 */
export default async function generateExamKey(attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const rnd = crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 hex chars
    const examKey = `EXAM-${rnd}`;

    const exists = await Exam.findOne({ examKey });
    if (!exists) return examKey;
    // else loop and try again
  }
  throw new Error("Failed to generate unique exam key — try again");
}
