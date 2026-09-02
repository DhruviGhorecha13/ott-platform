import api from "./axios.js";

// Images are served by our own backend (locally generated poster/backdrop
// placeholders under /public/images), not TMDb's CDN — keeps the whole
// app usable with zero internet access.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
  /\/api\/?$/,
  ""
);
export const IMG_BASE = API_ORIGIN;
export const IMG_BASE_ORIGINAL = API_ORIGIN;

export const mediaUrl = (mediaPath) => {
  if (!mediaPath) return "";
  if (/^https?:\/\//i.test(mediaPath)) return mediaPath;
  return `${API_ORIGIN}${mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`}`;
};

export const getTrending = () => api.get("/movies/trending").then((r) => r.data);
export const getPopular = () => api.get("/movies/popular").then((r) => r.data);
export const getTopRated = () => api.get("/movies/top-rated").then((r) => r.data);
export const getTvPopular = () => api.get("/movies/tv-popular").then((r) => r.data);
export const getGenres = () => api.get("/movies/genres").then((r) => r.data);
export const getByGenre = (genreId) =>
  api.get(`/movies/genre/${genreId}`).then((r) => r.data);
export const searchMulti = (query) =>
  api.get("/movies/search", { params: { query } }).then((r) => r.data);
export const getDetails = (mediaType, id) =>
  api.get(`/movies/${mediaType}/${id}`).then((r) => r.data);
