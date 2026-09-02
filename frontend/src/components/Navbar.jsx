import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  InputBase,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(11,11,15,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Toolbar sx={{ gap: 3 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            textDecoration: "none",
            letterSpacing: 0.5,
          }}
        >
          StreamHub
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {user && (
            <Button color="inherit" component={Link} to="/my-list">
              My List
            </Button>
          )}
          {user?.role === "admin" && <Button color="inherit" component={Link} to="/admin">Admin</Button>}
          {user && <Button color="inherit" component={Link} to="/subscription">Plans</Button>}
        </Box>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            px: 1,
          }}
        >
          <InputBase
            placeholder="Search movies & shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ color: "inherit", px: 1, width: 220 }}
          />
          <IconButton type="submit" size="small" sx={{ color: "inherit" }}>
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>

        {user ? (
          <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>{user.name}</MenuItem>
              <MenuItem
                onClick={() => {
                  logout();
                  setAnchorEl(null);
                  navigate("/");
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button variant="contained" color="primary" component={Link} to="/login">
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
