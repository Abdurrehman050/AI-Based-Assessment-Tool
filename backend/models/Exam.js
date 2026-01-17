import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, required: true },
  questionType: { type: String, required: true },

  numMcqs: { type: Number, default: 0 },
  numShorts: { type: Number, default: 0 },

  examKey: { type: String, required: true, unique: true },

  // 🧠 Exam Content
  questions: {
    mcqs: [
      {
        question: String,
        options: [String],
        answer: String,
      },
    ],
    shortQuestions: [
      {
        question: String,
        answer: String,
      },
    ],
  },

  // 🧪 AI workflow fields
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },

  isActive: {
    type: Boolean,
    default: false,
  },
  aiGenerated: {
    type: Boolean,
    default: true,
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  createdAt: { type: Date, default: Date.now },
});

const Exam = mongoose.model("Exam", examSchema);
export default Exam;
