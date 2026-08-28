import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// @route  GET /api/watchlist
router.get("/", protect, async (req, res) => {
  res.json(req.user.watchlist);
});

// @route  POST /api/watchlist
// body: { tmdbId, mediaType, title, posterPath }
router.post("/", protect, async (req, res) => {
  try {
    const { tmdbId, mediaType, title, posterPath } = req.body;
    if (!tmdbId || !mediaType || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(req.user._id);

    const alreadyExists = user.watchlist.some(
      (item) => item.tmdbId === tmdbId && item.mediaType === mediaType
    );
    if (alreadyExists) {
      return res.status(400).json({ message: "Already in watchlist" });
    }

    user.watchlist.push({ tmdbId, mediaType, title, posterPath });
    await user.save();

    res.status(201).json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  DELETE /api/watchlist/:tmdbId/:mediaType
router.delete("/:tmdbId/:mediaType", protect, async (req, res) => {
  try {
    const { tmdbId, mediaType } = req.params;
    const user = await User.findById(req.user._id);

    user.watchlist = user.watchlist.filter(
      (item) => !(item.tmdbId === Number(tmdbId) && item.mediaType === mediaType)
    );
    await user.save();

    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
