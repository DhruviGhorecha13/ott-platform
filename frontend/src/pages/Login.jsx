import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link as MLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("credentials");
  const [code, setCode] = useState("");
  const { requestCode, verifyCode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestCode("login", { email, password });
      setStep("code");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const verified = await verifyCode("login", email, code);
      navigate(verified.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        px: 2,
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {step === "code" ? "Verify your email" : "Sign In"}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={step === "code" ? handleVerify : handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {step === "code" ? (
            <TextField label="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputProps={{ inputMode: "numeric", maxLength: 6 }} required fullWidth />
          ) : <>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          </>}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? "Please wait..." : step === "code" ? "Verify and continue" : "Send verification code"}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          New here?{" "}
          <MLink component={Link} to="/signup">
            Create an account
          </MLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
