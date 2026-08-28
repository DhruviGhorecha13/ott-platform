import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { getDetails, IMG_BASE, IMG_BASE_ORIGINAL } from "../api/movies.js";
import MovieRow from "../components/MovieRow.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "../api/watchlist.js";

const MovieDetail = () => {
  const { mediaType, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    getDetails(mediaType, id)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [mediaType, id]);

  useEffect(() => {
    if (!user) return;
    getWatchlist().then((list) => {
      setInWatchlist(
        list.some((i) => i.tmdbId === Number(id) && i.mediaType === mediaType)
      );
    });
  }, [user, id, mediaType]);

  const toggleWatchlist = async () => {
    if (!user || !data) return;
    const title = data.details.title || data.details.name;
    if (inWatchlist) {
      await removeFromWatchlist(id, mediaType);
      setInWatchlist(false);
    } else {
      await addToWatchlist({
        tmdbId: Number(id),
        mediaType,
        title,
        posterPath: data.details.poster_path,
      });
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!data) return null;

  const { details, cast, videos, similar } = data;
  const title = details.title || details.name;
  const trailer = videos.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  return (
    <Box>
      <Box
        sx={{
          height: { xs: "45vh", md: "60vh" },
          backgroundImage: `linear-gradient(to top, #0b0b0f 5%, rgba(11,11,15,0.4) 60%), url(${IMG_BASE_ORIGINAL}${details.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box sx={{ px: { xs: 3, md: 6 }, mt: -8, position: "relative" }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
          <Chip label={`★ ${details.vote_average?.toFixed(1)}`} color="primary" size="small" />
          <Chip label={details.release_date || details.first_air_date} size="small" />
          {details.genres?.map((g) => (
            <Chip key={g.id} label={g.name} size="small" variant="outlined" />
          ))}
        </Stack>

        <Typography variant="body1" sx={{ maxWidth: 700, mb: 3 }}>
          {details.overview}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          {trailer && (
            <Button
              variant="contained"
              size="large"
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener"
            >
              ▶ Watch Trailer
            </Button>
          )}
          {user && (
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              startIcon={inWatchlist ? <CheckIcon /> : <AddIcon />}
              onClick={toggleWatchlist}
            >
              {inWatchlist ? "In My List" : "Add to My List"}
            </Button>
          )}
        </Stack>

        {cast?.length > 0 && (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Cast
            </Typography>
            <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 2, mb: 3 }}>
              {cast.map((c) => (
                <Box key={c.id} sx={{ textAlign: "center", flex: "0 0 auto", width: 90 }}>
                  <Avatar
                    src={c.profile_path ? `${IMG_BASE}${c.profile_path}` : undefined}
                    sx={{ width: 70, height: 70, mx: "auto", mb: 1 }}
                  >
                    {c.name?.[0]}
                  </Avatar>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    {c.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Box>

      <MovieRow title="More Like This" items={similar} />
    </Box>
  );
};

export default MovieDetail;
