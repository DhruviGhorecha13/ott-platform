import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const watchlistItemSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    posterPath: { type: String },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    watchlist: [watchlistItemSchema],
    watchHistory: [
      {
        tmdbId: Number,
        mediaType: String,
        title: String,
        watchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
