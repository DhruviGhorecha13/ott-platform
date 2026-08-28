import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// ---- Local, offline catalog -----------------------------------------
// No external API calls. Data lives in data/movies.json; poster and
// backdrop images are generated placeholder SVGs served from
// /images/... (see server.js static mount + scripts/generateImages.js).
// This keeps the whole app runnable with zero internet access, which
// matters for demoing on a network that may block outbound calls.
const dataPath = path.join(__dirname, "..", "data", "movies.json");
const { titles, genres } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Shape each raw title into the TMDb-like list-item format the
// frontend already expects (item.title/name, poster_path, etc).
const toListItem = (t) => ({
  id: t.id,
  media_type: t.media_type,
  title: t.title,
  name: t.title,
  overview: t.overview,
  poster_path: `/images/posters/${t.id}.svg`,
  backdrop_path: `/images/backdrops/${t.id}.svg`,
  vote_average: t.vote_average,
  release_date: t.release_date,
  first_air_date: t.release_date,
  genre_ids: t.genre_ids,
});

const allItems = titles.map(toListItem);

const searchByType = (mediaType) =>
  allItems.filter((i) => i.media_type === mediaType);

// @route  GET /api/movies/trending
router.get("/trending", (req, res) => {
  const results = [...allItems].sort((a, b) => b.vote_average - a.vote_average);
  res.json({ results });
});

// @route  GET /api/movies/popular
router.get("/popular", (req, res) => {
  res.json({ results: searchByType("movie") });
});

// @route  GET /api/movies/top-rated
router.get("/top-rated", (req, res) => {
  const results = searchByType("movie").sort(
    (a, b) => b.vote_average - a.vote_average
  );
  res.json({ results });
});

// @route  GET /api/movies/tv-popular
router.get("/tv-popular", (req, res) => {
  res.json({ results: searchByType("tv") });
});

// @route  GET /api/movies/genres
router.get("/genres", (req, res) => {
  res.json({ genres });
});

// @route  GET /api/movies/genre/:genreId
router.get("/genre/:genreId", (req, res) => {
  const genreId = Number(req.params.genreId);
  const results = allItems.filter((i) => i.genre_ids.includes(genreId));
  res.json({ results });
});

// @route  GET /api/movies/search?query=...
router.get("/search", (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required" });
  const q = query.toLowerCase();
  const results = allItems.filter((i) => i.title.toLowerCase().includes(q));
  res.json({ results });
});

// @route  GET /api/movies/:mediaType/:id  (mediaType = movie | tv)
router.get("/:mediaType/:id", (req, res) => {
  const { mediaType, id } = req.params;
  const raw = titles.find(
    (t) => t.id === Number(id) && t.media_type === mediaType
  );
  if (!raw) return res.status(404).json({ message: "Title not found" });

  const details = {
    ...toListItem(raw),
    genres: raw.genre_ids.map((gid) => genres.find((g) => g.id === gid)).filter(Boolean),
  };

  const cast = (raw.cast || []).map((name, idx) => ({
    id: idx + 1,
    name,
    character: "",
    profile_path: null,
  }));

  // Similar = other titles sharing at least one genre, same media type
  // preferred, ranked by number of shared genres.
  const similar = allItems
    .filter((i) => i.id !== raw.id)
    .map((i) => ({
      item: i,
      score:
        i.genre_ids.filter((g) => raw.genre_ids.includes(g)).length +
        (i.media_type === raw.media_type ? 0.5 : 0),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.item);

  res.json({
    details,
    cast,
    videos: [], // trailers need internet (YouTube embeds) - none offline
    similar,
  });
});

export default router;
