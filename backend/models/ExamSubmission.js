import mongoose from "mongoose";

const { Schema } = mongoose;

const examSubmissionSchema = new Schema(
  {
    exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    mcqAnswers: [
      {
        questionId: { type: Schema.Types.ObjectId },
        selectedOption: { type: String },
      },
    ],
    shortAnswers: [
      {
        questionId: { type: Schema.Types.ObjectId },
        answerText: { type: String },
        aiScore: { type: Number, default: null },
        aiFeedback: { type: String, default: "" },
      },
    ],
    gradedBy: { type: Schema.Types.ObjectId, ref: "Teacher", default: null },
    score: { type: Number, default: 0 },
    checkedByAI: { type: Boolean, default: false },
    isSubmitted: { type: Boolean, default: false },
    isGraded: { type: Boolean, default: false },
    feedback: { type: String },
  },
  { timestamps: true }
);

const ExamSubmission = mongoose.model("ExamSubmission", examSubmissionSchema);

export default ExamSubmission;
