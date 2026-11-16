import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: mongoose.Schema.Types.ObjectId, ref: "Token", required: true },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    comment: { type: String, trim: true, maxlength: [500, "Comment cannot exceed 500 characters"] },
  },
  { timestamps: true }
);

feedbackSchema.index({ token: 1 }, { unique: true });
feedbackSchema.index({ farmer: 1, createdAt: -1 });
feedbackSchema.index({ center: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;