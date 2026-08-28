import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import HeroBanner from "../components/HeroBanner.jsx";
import MovieRow from "../components/MovieRow.jsx";
import {
  getTrending,
  getPopular,
  getTopRated,
  getTvPopular,
} from "../api/movies.js";

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, p, tr, tv] = await Promise.all([
          getTrending(),
          getPopular(),
          getTopRated(),
          getTvPopular(),
        ]);
        setTrending(t.results || []);
        setPopular(p.results || []);
        setTopRated(tr.results || []);
        setTvShows(tv.results || []);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const heroItem = trending[0];

  return (
    <Box>
      <HeroBanner item={heroItem} />
      <Box sx={{ mt: -6, position: "relative", zIndex: 1 }}>
        <MovieRow title="Trending Now" items={trending} />
        <MovieRow title="Popular Movies" items={popular} />
        <MovieRow title="Top Rated" items={topRated} />
        <MovieRow title="Popular TV Shows" items={tvShows} />
      </Box>
    </Box>
  );
};

export default Home;
