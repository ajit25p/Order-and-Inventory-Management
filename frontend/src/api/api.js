import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Products ──────────────────────────────────────────────────────────
export const getProducts = (page = 1, pageSize = 20, search = '') =>
  api.get('/products', { params: { page, page_size: pageSize, search: search || undefined } });

export const getProduct = (id) => api.get(`/products/${id}`);

export const createProduct = (data) => api.post('/products/', data);

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ── Customers ─────────────────────────────────────────────────────────
export const getCustomers = (page = 1, pageSize = 20, search = '') =>
  api.get('/customers', { params: { page, page_size: pageSize, search: search || undefined } });

export const getCustomer = (id) => api.get(`/customers/${id}`);

export const createCustomer = (data) => api.post('/customers/', data);

export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// ── Orders ────────────────────────────────────────────────────────────
export const getOrders = (page = 1, pageSize = 20) =>
  api.get('/orders', { params: { page, page_size: pageSize } });

export const getOrder = (id) => api.get(`/orders/${id}`);

export const createOrder = (data) => api.post('/orders/', data);

export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// ── Dashboard ─────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard');

export default api;
