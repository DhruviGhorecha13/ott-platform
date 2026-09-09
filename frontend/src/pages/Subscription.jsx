import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { createOrder, getPlans, verifyPayment } from "../api/subscription.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const subscriptionExpiresAt = user?.subscription?.expiresAt
    ? new Date(user.subscription.expiresAt)
    : null;
  const hasActiveSubscription = subscriptionExpiresAt && subscriptionExpiresAt > new Date();
  const selectedPlan = plans.find((plan) => plan.id === user?.subscription?.plan);

  useEffect(() => { getPlans().then((data) => setPlans(data.plans)).catch(() => setError("Could not load plans")).finally(() => setLoading(false)); }, []);

  const pay = async (plan) => {
    if (!user) return navigate("/login");
    try {
      setError("");
      const result = await createOrder(plan.id);
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Razorpay Checkout could not load"));
          document.body.appendChild(script);
        });
      }
      const checkout = new window.Razorpay({
        key: result.keyId,
        amount: result.order.amount,
        currency: result.order.currency,
        name: "StreamHub",
        description: `${plan.name} subscription`,
        order_id: result.order.id,
        prefill: { name: user.name, email: user.email },
        handler: async (response) => {
          try {
            const verified = await verifyPayment({ ...response, plan: plan.id });
            updateUser(verified.user);
            navigate("/");
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed");
          }
        },
        theme: { color: "#e50914" },
      });
      checkout.on("payment.failed", () => setError("Payment failed. Please try again."));
      checkout.open();
    } catch (err) { setError(err.response?.data?.message || "Payment could not be completed"); }
  };

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  return <Box sx={{ px: { xs: 2, md: 6 }, py: 6, maxWidth: 1100, mx: "auto" }}>
    <Typography variant="h4" fontWeight={800} gutterBottom>Choose your plan</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>Razorpay test checkout. No real money will be charged.</Typography>
    <Paper sx={{ p: 2.5, mb: 4, border: "1px solid", borderColor: hasActiveSubscription ? "success.main" : "divider" }}>
      <Typography variant="body2" color="text.secondary">Signed in as</Typography>
      <Typography fontWeight={700} sx={{ mb: 1 }}>{user?.email}</Typography>
      {hasActiveSubscription ? (
        <Typography variant="body2">
          Current subscription: <strong>{selectedPlan?.name || user.subscription.plan}</strong>
          {user.subscription.amount ? ` · ₹${user.subscription.amount}` : ""}
          {` · Expires ${subscriptionExpiresAt.toLocaleDateString()}`}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">No active subscription. Choose a plan to unlock all movies and TV shows.</Typography>
      )}
    </Paper>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      {plans.map((plan) => <Paper key={plan.id} sx={{ p: 3, flex: 1 }}>
        <Typography variant="h6" fontWeight={700}>{plan.name}</Typography>
        <Typography variant="h4" sx={{ my: 2 }}>₹{plan.amount}</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Full movies, TV shows, posters and clips</Typography>
        <Button fullWidth variant="contained" onClick={() => pay(plan)}>Pay ₹{plan.amount}</Button>
      </Paper>)}
    </Stack>
  </Box>;
};

export default Subscription;