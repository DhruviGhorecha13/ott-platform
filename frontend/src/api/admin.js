import api from "./axios.js";

export const getAdminCatalog = () => api.get("/admin/movies").then((r) => r.data);
export const createTitle = (title) => api.post("/admin/movies", title).then((r) => r.data);
export const updateTitle = (id, title) => api.put(`/admin/movies/${id}`, title).then((r) => r.data);
export const deleteTitle = (id) => api.delete(`/admin/movies/${id}`).then((r) => r.data);