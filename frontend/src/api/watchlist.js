import api from "./axios.js";

export const getWatchlist = () => api.get("/watchlist").then((r) => r.data);

export const addToWatchlist = (item) =>
  api.post("/watchlist", item).then((r) => r.data);

export const removeFromWatchlist = (tmdbId, mediaType) =>
  api.delete(`/watchlist/${tmdbId}/${mediaType}`).then((r) => r.data);
