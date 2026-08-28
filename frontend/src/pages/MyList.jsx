import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getWatchlist } from "../api/watchlist.js";
import { IMG_BASE } from "../api/movies.js";

const MyList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getWatchlist()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 3, md: 6 }, py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        My List
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">
          Your list is empty. Add titles from any movie or show page.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {items.map((item) => (
            <Box
              key={`${item.tmdbId}-${item.mediaType}`}
              onClick={() => navigate(`/title/${item.mediaType}/${item.tmdbId}`)}
              sx={{
                width: 160,
                cursor: "pointer",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.06)" },
              }}
            >
              <Box
                component="img"
                src={`${IMG_BASE}${item.posterPath}`}
                alt={item.title}
                sx={{
                  width: "100%",
                  height: 230,
                  objectFit: "cover",
                  borderRadius: 2,
                  display: "block",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.title}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MyList;
