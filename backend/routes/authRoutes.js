import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import VerificationCode from "../models/VerificationCode.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendVerificationCode } from "../utils/email.js";

const router = express.Router();
const CODE_TTL_MS = 10 * 60 * 1000;

const generateToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "30d" }
);

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  subscription: user.subscription,
  token: generateToken(user),
});

const issueCode = async (email, purpose, payload) => {
  const code = String(crypto.randomInt(100000, 1000000));
  await VerificationCode.deleteMany({ email, purpose });
  await VerificationCode.create({
    email,
    purpose,
    codeHash: await bcrypt.hash(code, 10),
    payload,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });
  await sendVerificationCode(email, code);
};

router.post("/request-code", async (req, res) => {
  try {
    const { purpose, name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !["login", "signup"].includes(purpose)) {
      return res.status(400).json({ message: "Email and valid purpose are required" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (purpose === "signup") {
      if (!name || !password || password.length < 6) {
        return res.status(400).json({ message: "Name and a password of at least 6 characters are required" });
      }
      if (existing) return res.status(400).json({ message: "User already exists" });
    } else if (!existing || !(await existing.matchPassword(password || ""))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (purpose === "login" && normalizedEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase() && existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
    }

    const payload = purpose === "signup"
      ? { name, password: await bcrypt.hash(password, 10) }
      : undefined;
    await issueCode(normalizedEmail, purpose, payload);
    res.json({ message: "A six-digit verification code was sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const { purpose, email, code } = req.body;
    const challenge = await VerificationCode.findOne({ email: email?.trim().toLowerCase(), purpose });
    if (!challenge || challenge.expiresAt < new Date() || !(await bcrypt.compare(code || "", challenge.codeHash))) {
      return res.status(401).json({ message: "Invalid or expired verification code" });
    }

    let user = await User.findOne({ email: challenge.email });
    if (purpose === "signup") {
      user = await User.create({
        ...challenge.payload,
        email: challenge.email,
        role: challenge.email === process.env.ADMIN_EMAIL?.trim().toLowerCase() ? "admin" : "user",
      });
    }
    await VerificationCode.deleteOne({ _id: challenge._id });
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, async (req, res) => res.json(req.user));

export default router;
