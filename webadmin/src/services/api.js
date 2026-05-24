import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

// ── Products ──────────────────────────────────────────
export const getProducts    = ()       => api.get("/products");
export const getProductById = (id)     => api.get(`/products/${id}`);
export const createProduct  = (data)   => api.post("/products", data);
export const updateProduct  = (id, d)  => api.put(`/products/${id}`, d);
export const deleteProduct  = (id)     => api.delete(`/products/${id}`);

// ── Categories ────────────────────────────────────────
export const getCategories    = ()       => api.get("/categories");
export const getCategoryById  = (id)     => api.get(`/categories/${id}`);
export const createCategory   = (data)   => api.post("/categories", data);
export const updateCategory   = (id, d)  => api.put(`/categories/${id}`, d);
export const deleteCategory   = (id)     => api.delete(`/categories/${id}`);

export default api;
