import mongoose from "mongoose";

const { Schema } = mongoose;

const candidateSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    institution: { type: String },
    role: { type: String, enum: ["candidate"], default: "candidate" },
    attemptedExams: [{ type: Schema.Types.ObjectId, ref: "ExamSubmission" }],
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
