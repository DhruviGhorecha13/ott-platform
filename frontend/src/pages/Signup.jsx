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

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
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
          Create Account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
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
            helperText="At least 6 characters"
          />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <MLink component={Link} to="/login">
            Sign in
          </MLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
