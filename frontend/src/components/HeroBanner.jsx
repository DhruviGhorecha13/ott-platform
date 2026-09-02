import React from "react";
import { Box, Typography, Button, Chip, Stack } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";
import { mediaUrl } from "../api/movies.js";

const HeroBanner = ({ item }) => {
  const navigate = useNavigate();
  if (!item) return null;

  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name;

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "50vh", md: "70vh" },
        width: "100%",
        backgroundImage: `linear-gradient(to top, #0b0b0f 5%, rgba(11,11,15,0.3) 50%, rgba(11,11,15,0.7) 100%), url(${mediaUrl(item.backdrop_path)})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        display: "flex",
        alignItems: "flex-end",
        px: { xs: 3, md: 6 },
        pb: 6,
      }}
    >
      <Box sx={{ maxWidth: 560 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={`★ ${item.vote_average?.toFixed(1) ?? "N/A"}`}
            size="small"
            color="primary"
          />
          <Chip label={mediaType === "movie" ? "Movie" : "TV Series"} size="small" />
        </Stack>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {item.overview}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate(`/watch/${mediaType}/${item.id}`)}
          >
            Play
          </Button>
          <Button
            variant="outlined"
            size="large"
            color="inherit"
            startIcon={<InfoOutlinedIcon />}
            onClick={() => navigate(`/title/${mediaType}/${item.id}`)}
          >
            More Info
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default HeroBanner;
