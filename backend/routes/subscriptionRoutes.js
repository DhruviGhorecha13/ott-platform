import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();
const PLANS = {
  "1-month": { name: "1 Month", months: 1, amount: 500 },
  "6-month": { name: "6 Months", months: 6, amount: 2500 },
  "12-month": { name: "12 Months", months: 12, amount: 5000 },
};

export const getPlans = () => Object.entries(PLANS).map(([id, plan]) => ({ id, ...plan }));
export const hasActiveSubscription = (user) => user?.role === "admin" || Boolean(
  user?.subscription?.expiresAt && new Date(user.subscription.expiresAt) > new Date()
);

const razorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

router.get("/plans", (req, res) => res.json({ plans: getPlans() }));

router.post("/create-order", protect, async (req, res) => {
  try {
    const plan = PLANS[req.body.plan];
    if (!plan) return res.status(400).json({ message: "Invalid subscription plan" });
    const order = await razorpay().orders.create({
      amount: plan.amount * 100,
      currency: "INR",
      receipt: `subscription_${req.user._id}_${Date.now()}`,
      notes: { plan: req.body.plan, userId: String(req.user._id) },
    });
    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID, plan: { id: req.body.plan, ...plan } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const received = Buffer.from(razorpay_signature || "");
    if (received.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), received)) {
      return res.status(400).json({ message: "Payment signature verification failed" });
    }
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) return res.status(400).json({ message: "Invalid subscription plan" });
    const order = await razorpay().orders.fetch(razorpay_order_id);
    if (order.notes?.userId !== String(req.user._id) || order.notes?.plan !== plan || order.amount !== selectedPlan.amount * 100) {
      return res.status(400).json({ message: "Payment order does not match this subscription" });
    }
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + selectedPlan.months);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscription: { plan, amount: selectedPlan.amount, startsAt, expiresAt } },
      { new: true }
    ).select("-password");
    res.json({ message: "Payment verified", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;