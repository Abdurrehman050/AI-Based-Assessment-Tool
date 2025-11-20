import mongoose from "mongoose";

const { Schema } = mongoose;

const teacherSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    institution: { type: String },
    subject: { type: String },
    role: { type: String, enum: ["teacher"], default: "teacher" },
    exams: [{ type: Schema.Types.ObjectId, ref: "Exam" }],
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
