import api from "./axios.js";

export const getPlans = () => api.get("/subscription/plans").then((r) => r.data);
export const createOrder = (plan) => api.post("/subscription/create-order", { plan }).then((r) => r.data);
export const verifyPayment = (payload) => api.post("/subscription/verify", payload).then((r) => r.data);
export const purchasePlan = (plan) => api.post("/subscription/purchase", { plan }).then((r) => r.data);