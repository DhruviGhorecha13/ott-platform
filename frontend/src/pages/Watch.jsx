import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getDetails, mediaUrl } from "../api/movies.js";

const Watch = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDetails(mediaType, id)
      .then((res) => setData(res))
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login", { replace: true });
        else if (err.response?.status === 402) navigate("/subscription");
      })
      .finally(() => setLoading(false));
  }, [mediaType, id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!data) return null;

  const { details } = data;
  const title = details.title || details.name;

  return (
    <Box sx={{ bgcolor: "#000", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "#fff" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#fff" }}>
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          maxWidth: 960,
          mx: "auto",
          px: { xs: 0, sm: 2 },
        }}
      >
        {details.video_source === "youtube" ? (
          <Box component="iframe" src={details.video_path} title={title} referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen sx={{ width: "100%", aspectRatio: "16 / 9", border: 0, display: "block" }} />
        ) : (
          <Box component="video" key={details.video_path} src={mediaUrl(details.video_path)} controls autoPlay sx={{ width: "100%", display: "block", bgcolor: "#000", borderRadius: { xs: 0, sm: 2 } }} />
        )}
      </Box>

      <Box sx={{ px: 3, py: 3, maxWidth: 960, mx: "auto" }}>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
          {details.video_source === "youtube"
            ? "Official YouTube trailer"
            : details.real_media
              ? `This is a real clip from the open-source film "${title}" (${details.release_date?.slice(
                0,
                4
              )}), released by the Blender Foundation under a Creative Commons Attribution license.`
              : "This is a locally generated preview clip, not the full title — this project runs fully offline, so no licensed video is streamed."}
        </Typography>
      </Box>
    </Box>
  );
};

export default Watch;
