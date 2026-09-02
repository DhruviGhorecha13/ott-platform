import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { createTitle, deleteTitle, getAdminCatalog, updateTitle } from "../api/admin.js";
import api from "../api/axios.js";

const emptyTitle = { title: "", media_type: "movie", overview: "", vote_average: 0, release_date: "", genre_ids: [], cast: [] };

const Admin = () => {
  const [catalog, setCatalog] = useState({ titles: [], genres: [] });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => getAdminCatalog().then(setCatalog).catch((err) => setError(err.response?.data?.message || "Could not load catalog"));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const payload = { ...editing, genre_ids: String(editing.genre_ids).split(",").map(Number).filter(Boolean), cast: String(editing.cast).split(",").map((name) => name.trim()).filter(Boolean) };
      if (editing.id) await updateTitle(editing.id, payload); else await createTitle(payload);
      setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || "Could not save title"); }
  };

  const remove = async (id) => {
    try { await deleteTitle(id); load(); } catch (err) { setError(err.response?.data?.message || "Could not delete title"); }
  };

  const syncMedia = async () => {
    try { await api.post("/admin/movies/sync-media"); load(); } catch (err) { setError(err.response?.data?.message || "Could not sync media"); }
  };

  const syncOmdb = async () => {
    try { await api.post("/admin/movies/sync-omdb"); load(); } catch (err) { setError(err.response?.data?.message || "Could not sync OMDb data"); }
  };

  return <Box sx={{ p: { xs: 2, md: 5 } }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Box><Typography variant="h4" fontWeight={800}>Catalog admin</Typography><Typography color="text.secondary">Manage movies and TV shows</Typography></Box>
      <Stack direction="row" spacing={1}><Button onClick={syncOmdb}>Sync OMDb posters</Button><Button onClick={syncMedia}>Sync TMDb media</Button><Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing({ ...emptyTitle })}>Add title</Button></Stack>
    </Stack>
    {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}
    <Stack spacing={1}>
      {catalog.titles.map((item) => <Paper key={item.id} sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box sx={{ flexGrow: 1 }}><Typography fontWeight={700}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.media_type.toUpperCase()} · ID {item.id} · ★ {item.vote_average}</Typography></Box>
          <Button startIcon={<EditIcon />} onClick={() => setEditing({ ...item, genre_ids: item.genre_ids.join(","), cast: item.cast.join(", ") })}>Edit</Button>
          <Button color="error" startIcon={<DeleteIcon />} onClick={() => remove(item.id)}>Delete</Button>
        </Stack>
      </Paper>)}
    </Stack>
    <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
      <DialogTitle>{editing?.id ? "Edit title" : "Add title"}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Title" value={editing?.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} fullWidth />
        <TextField select label="Type" value={editing?.media_type || "movie"} onChange={(e) => setEditing({ ...editing, media_type: e.target.value })} fullWidth><MenuItem value="movie">Movie</MenuItem><MenuItem value="tv">TV show</MenuItem></TextField>
        <TextField label="Overview" multiline minRows={3} value={editing?.overview || ""} onChange={(e) => setEditing({ ...editing, overview: e.target.value })} fullWidth />
        <TextField label="Rating" type="number" value={editing?.vote_average || 0} onChange={(e) => setEditing({ ...editing, vote_average: e.target.value })} fullWidth />
        <TextField label="Release date" type="date" InputLabelProps={{ shrink: true }} value={editing?.release_date || ""} onChange={(e) => setEditing({ ...editing, release_date: e.target.value })} fullWidth />
        <TextField label="Genre IDs, comma separated" value={editing?.genre_ids || ""} onChange={(e) => setEditing({ ...editing, genre_ids: e.target.value })} fullWidth />
        <TextField label="Cast, comma separated" value={editing?.cast || ""} onChange={(e) => setEditing({ ...editing, cast: e.target.value })} fullWidth />
        <TextField label="Poster URL" placeholder="https://.../poster.jpg" value={editing?.poster_url || ""} onChange={(e) => setEditing({ ...editing, poster_url: e.target.value })} fullWidth />
        <TextField label="Backdrop URL" placeholder="https://.../backdrop.jpg" value={editing?.backdrop_url || ""} onChange={(e) => setEditing({ ...editing, backdrop_url: e.target.value })} fullWidth />
        <TextField label="Video or trailer URL" placeholder="YouTube embed or licensed MP4 URL" value={editing?.video_url || ""} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} fullWidth />
      </Stack></DialogContent>
      <DialogActions><Button onClick={() => setEditing(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
    </Dialog>
  </Box>;
};

export default Admin;