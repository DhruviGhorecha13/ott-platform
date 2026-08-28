import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// Serves the generated poster/backdrop placeholder images locally, so the
// catalog needs zero internet access (no calls to image.tmdb.org).
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.get("/", (req, res) => {
  res.json({ message: "OTT Streaming Platform API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/watchlist", watchlistRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
