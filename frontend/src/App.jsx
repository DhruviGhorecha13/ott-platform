import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Search from "./pages/Search.jsx";
import MyList from "./pages/MyList.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/title/:mediaType/:id" element={<MovieDetail />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <MyList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  );
}

export default App;
