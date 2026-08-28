import React from "react";
import { Box, Typography } from "@mui/material";
import MovieCard from "./MovieCard.jsx";

const MovieRow = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ mb: 4, px: { xs: 3, md: 6 } }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 1,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 3,
          },
        }}
      >
        {items.map((item) => (
          <MovieCard key={`${item.id}-${item.media_type || "x"}`} item={item} />
        ))}
      </Box>
    </Box>
  );
};

export default MovieRow;
