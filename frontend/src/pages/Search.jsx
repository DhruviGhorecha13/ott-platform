import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Grid } from "@mui/material";
import { searchMulti } from "../api/movies.js";
import MovieCard from "../components/MovieCard.jsx";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchMulti(query)
      .then((data) =>
        setResults((data.results || []).filter((r) => r.media_type !== "person"))
      )
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <Box sx={{ px: { xs: 3, md: 6 }, py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {query ? `Results for "${query}"` : "Search for a movie or show"}
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {!loading && query && results.length === 0 && (
        <Typography color="text.secondary">
          No results found. Try a different title.
        </Typography>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {results.map((item) => (
          <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
        ))}
      </Box>
    </Box>
  );
};

export default Search;
