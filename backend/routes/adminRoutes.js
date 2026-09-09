import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { reloadCatalog } from "./movieRoutes.js";
import axios from "axios";

const router = express.Router();
const dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "movies.json");

const readCatalog = () => JSON.parse(fs.readFileSync(dataPath, "utf8"));
const writeCatalog = (catalog) => {
  fs.writeFileSync(dataPath, `${JSON.stringify(catalog, null, 2)}\n`);
  reloadCatalog();
};
const cleanTitle = (body) => ({
  id: Number(body.id),
  media_type: body.media_type === "tv" ? "tv" : "movie",
  title: String(body.title || "").trim(),
  overview: String(body.overview || "").trim(),
  vote_average: Number(body.vote_average) || 0,
  release_date: body.release_date || "",
  genre_ids: Array.isArray(body.genre_ids) ? body.genre_ids.map(Number).filter(Boolean) : [],
  cast: Array.isArray(body.cast) ? body.cast.map(String) : [],
  ...(body.image_ext ? { image_ext: body.image_ext } : {}),
  ...(body.poster_url ? { poster_url: String(body.poster_url) } : {}),
  ...(body.backdrop_url ? { backdrop_url: String(body.backdrop_url) } : {}),
  ...(body.video_url ? { video_url: String(body.video_url) } : {}),
  ...(body.real_media ? { real_media: true } : {}),
  ...(body.credit ? { credit: String(body.credit) } : {}),
});

router.use(protect, requireAdmin);
router.get("/movies", (req, res) => res.json(readCatalog()));

router.post("/movies/sync-omdb", async (req, res) => {
  if (!process.env.OMDB_API_KEY) return res.status(400).json({ message: "OMDB_API_KEY is required" });
  try {
    const catalog = readCatalog();
    let synced = 0;
    for (const title of catalog.titles) {
      const params = {
        apikey: process.env.OMDB_API_KEY,
        t: title.title,
        type: title.media_type === "tv" ? "series" : "movie",
        y: title.release_date?.slice(0, 4),
      };
      const result = (await axios.get("https://www.omdbapi.com/", { params })).data;
      if (result.Response !== "True") continue;
      title.poster_url = result.Poster && result.Poster !== "N/A" ? result.Poster : title.poster_url;
      title.overview = result.Plot && result.Plot !== "N/A" ? result.Plot : title.overview;
      title.vote_average = Number(result.imdbRating) || title.vote_average;
      title.release_date = result.Released !== "N/A" ? result.Released : title.release_date;
      if (result.Genre && result.Genre !== "N/A") {
        const genreNames = result.Genre.split(", ").map((name) => name.toLowerCase());
        title.genre_ids = catalog.genres.filter((genre) => genreNames.includes(genre.name.toLowerCase())).map((genre) => genre.id);
      }
      if (result.Actors && result.Actors !== "N/A") title.cast = result.Actors.split(", ").map((actor) => actor.trim());
      if (result.imdbID) title.imdb_id = result.imdbID;
      synced++;
    }
    writeCatalog(catalog);
    res.json({ message: `Synced OMDb data for ${synced} titles` });
  } catch (err) {
    res.status(502).json({ message: err.response?.data?.Error || err.message });
  }
});

router.post("/movies/sync-youtube", async (req, res) => {
  if (!process.env.YOUTUBE_API_KEY) return res.status(400).json({ message: "YOUTUBE_API_KEY is required for YouTube trailers" });
  try {
    const catalog = readCatalog();
    let trailers = 0;
    let failed = 0;
    let lastError = "";
    for (const title of catalog.titles) {
      try {
        const kind = title.media_type === "tv" ? "TV series" : "movie";
        const search = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            key: process.env.YOUTUBE_API_KEY,
            part: "snippet",
            q: `${title.title} ${kind} official trailer`,
            type: "video",
            maxResults: 5,
            videoEmbeddable: "true",
          },
        });
        const trailer = search.data.items?.find((video) => /trailer|teaser|official/i.test(video.snippet?.title || "")) || search.data.items?.[0];
        if (trailer?.id?.videoId) {
          title.video_url = `https://www.youtube.com/embed/${trailer.id.videoId}`;
          trailers++;
        }
      } catch (err) {
        failed++;
        lastError = err.response?.data?.error?.message || err.message;
      }
    }
    writeCatalog(catalog);
    res.json({ message: `Found ${trailers} YouTube trailers${failed ? ` (${failed} titles failed: ${lastError})` : ""}` });
  } catch (err) {
    res.status(502).json({ message: err.response?.data?.status_message || err.message });
  }
});

router.post("/movies", (req, res) => {
  const catalog = readCatalog();
  const title = cleanTitle({ ...req.body, id: Math.max(0, ...catalog.titles.map((item) => item.id)) + 1 });
  if (!title.title) return res.status(400).json({ message: "Title is required" });
  catalog.titles.push(title);
  writeCatalog(catalog);
  res.status(201).json(title);
});

router.put("/movies/:id", (req, res) => {
  const catalog = readCatalog();
  const index = catalog.titles.findIndex((item) => item.id === Number(req.params.id));
  if (index < 0) return res.status(404).json({ message: "Title not found" });
  const title = cleanTitle({ ...catalog.titles[index], ...req.body, id: catalog.titles[index].id });
  if (!title.title) return res.status(400).json({ message: "Title is required" });
  catalog.titles[index] = title;
  writeCatalog(catalog);
  res.json(title);
});

router.delete("/movies/:id", (req, res) => {
  const catalog = readCatalog();
  const originalLength = catalog.titles.length;
  catalog.titles = catalog.titles.filter((item) => item.id !== Number(req.params.id));
  if (catalog.titles.length === originalLength) return res.status(404).json({ message: "Title not found" });
  writeCatalog(catalog);
  res.json({ message: "Title deleted" });
});

export default router;