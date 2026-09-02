import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { getPlans, purchasePlan } from "../api/subscription.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { getPlans().then((data) => setPlans(data.plans)).catch(() => setError("Could not load plans")).finally(() => setLoading(false)); }, []);

  const pay = async (plan) => {
    if (!user) return navigate("/login");
    try {
      const result = await purchasePlan(plan.id);
      updateUser(result.user);
      navigate("/");
    } catch (err) { setError(err.response?.data?.message || "Payment could not be completed"); }
  };

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  return <Box sx={{ px: { xs: 2, md: 6 }, py: 6, maxWidth: 1100, mx: "auto" }}>
    <Typography variant="h4" fontWeight={800} gutterBottom>Choose your plan</Typography>
    <Typography color="text.secondary" sx={{ mb: 4 }}>Demo checkout. No real money is charged.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      {plans.map((plan) => <Paper key={plan.id} sx={{ p: 3, flex: 1 }}>
        <Typography variant="h6" fontWeight={700}>{plan.name}</Typography>
        <Typography variant="h4" sx={{ my: 2 }}>₹{plan.amount}</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Full movies, TV shows, posters and clips</Typography>
        <Button fullWidth variant="contained" onClick={() => pay(plan)}>Pay ₹{plan.amount} (Demo)</Button>
      </Paper>)}
    </Stack>
  </Box>;
};

export default Subscription;