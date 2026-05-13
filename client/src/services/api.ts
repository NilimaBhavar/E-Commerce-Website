import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tara_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tara_token");
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};

export const categoriesApi = {
  list: () => api.get("/categories").then((r) => r.data),
  get: (id: number) => api.get(`/categories/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string; imageUrl?: string }) =>
    api.post("/categories", data).then((r) => r.data),
  update: (id: number, data: { name?: string; description?: string; imageUrl?: string }) =>
    api.patch(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const productsApi = {
  list: (params?: {
    page?: number; limit?: number; categoryId?: number; search?: string;
    minPrice?: number; maxPrice?: number; sortBy?: string; inStock?: boolean;
  }) => api.get("/products", { params }).then((r) => r.data),
  featured: () => api.get("/products/featured").then((r) => r.data),
  offers: () => api.get("/products/offers").then((r) => r.data),
  get: (id: number) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data: {
    name: string; description?: string; price: number; originalPrice?: number;
    categoryId: number; brand?: string; stock: number; imageUrl: string;
    images?: string[]; isFeatured?: boolean; tags?: string[];
  }) => api.post("/products", data).then((r) => r.data),
  update: (id: number, data: {
    name?: string; description?: string; price?: number; originalPrice?: number;
    categoryId?: number; brand?: string; stock?: number; imageUrl?: string; isFeatured?: boolean;
  }) => api.patch(`/products/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/products/${id}`).then((r) => r.data),
};

export const cartApi = {
  get: () => api.get("/cart").then((r) => r.data),
  addItem: (data: { productId: number; quantity: number }) =>
    api.post("/cart/items", data).then((r) => r.data),
  updateItem: (productId: number, data: { quantity: number }) =>
    api.patch(`/cart/items/${productId}`, data).then((r) => r.data),
  removeItem: (productId: number) =>
    api.delete(`/cart/items/${productId}`).then((r) => r.data),
  clear: () => api.delete("/cart").then((r) => r.data),
};

export const wishlistApi = {
  get: () => api.get("/wishlist").then((r) => r.data),
  add: (productId: number) => api.post(`/wishlist/${productId}`).then((r) => r.data),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const ordersApi = {
  list: () => api.get("/orders").then((r) => r.data),
  get: (id: number) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data: {
    shippingAddress: string; city?: string; state?: string;
    pincode?: string; paymentMethod: string; notes?: string;
  }) => api.post("/orders", data).then((r) => r.data),
};

export const reviewsApi = {
  list: (productId: number) =>
    api.get(`/products/${productId}/reviews`).then((r) => r.data),
  create: (productId: number, data: { rating: number; comment?: string }) =>
    api.post(`/products/${productId}/reviews`, data).then((r) => r.data),
};

export const usersApi = {
  getProfile: () => api.get("/users/profile").then((r) => r.data),
  updateProfile: (data: {
    name?: string; phone?: string; address?: string;
    city?: string; state?: string; pincode?: string;
  }) => api.patch("/users/profile", data).then((r) => r.data),
};

export const adminApi = {
  getStats: () => api.get("/admin/stats").then((r) => r.data),
  listOrders: () => api.get("/admin/orders").then((r) => r.data),
  updateOrderStatus: (orderId: number, data: { status: string }) =>
    api.patch(`/admin/orders/${orderId}/status`, data).then((r) => r.data),
  listUsers: () => api.get("/admin/users").then((r) => r.data),
};
