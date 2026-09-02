import express from "express";
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

router.get("/plans", (req, res) => res.json({ plans: getPlans() }));

router.post("/purchase", protect, async (req, res) => {
  try {
    const plan = PLANS[req.body.plan];
    if (!plan) return res.status(400).json({ message: "Invalid subscription plan" });

    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + plan.months);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscription: { plan: req.body.plan, amount: plan.amount, startsAt, expiresAt } },
      { new: true }
    ).select("-password");
    res.json({ message: "Demo payment completed", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;