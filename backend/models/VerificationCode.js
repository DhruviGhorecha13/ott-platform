import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: ["login", "signup"], required: true },
    codeHash: { type: String, required: true },
    payload: { type: Object },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

verificationCodeSchema.index({ email: 1, purpose: 1 });

export default mongoose.model("VerificationCode", verificationCodeSchema);