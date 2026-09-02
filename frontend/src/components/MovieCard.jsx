import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { mediaUrl } from "../api/movies.js";

const MovieCard = ({ item }) => {
  const navigate = useNavigate();
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name;

  if (!item.poster_path) return null;

  return (
    <Box
      onClick={() => navigate(`/title/${mediaType}/${item.id}`)}
      sx={{
        flex: "0 0 auto",
        width: 160,
        cursor: "pointer",
        position: "relative",
        transition: "transform 0.2s ease",
        "&:hover": { transform: "scale(1.06)" },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          component="img"
          src={mediaUrl(item.poster_path)}
          alt={title}
          sx={{
            width: "100%",
            height: 230,
            objectFit: "cover",
            borderRadius: 2,
            display: "block",
          }}
        />
        {item.real_media && (
          <Chip
            label="Full clip"
            size="small"
            color="secondary"
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 700,
            }}
          />
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default MovieCard;
