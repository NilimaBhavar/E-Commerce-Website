// All React Query hooks for the Tara Shop API.
// Import from here instead of @/hooks/useApi.

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch, toQueryString } from '@/services/api';

// ─── Query key factories ────────────────────────────────────────────────────
export const getGetMeQueryKey = () => ['me'];
export const getGetCartQueryKey = () => ['cart'];
export const getGetWishlistQueryKey = () => ['wishlist'];
export const getGetOrderQueryKey = (id) => ['order', id];
export const getGetUserProfileQueryKey = () => ['userProfile'];
export const getListAllOrdersQueryKey = () => ['admin', 'orders'];
export const getGetProductQueryKey = (id) => ['product', id];
export const getListReviewsQueryKey = (productId) => ['reviews', productId];
export const getListProductsQueryKey = (params = {}) => ['products', params];
export const getListCategoriesQueryKey = () => ['categories'];

// ─── Auth ───────────────────────────────────────────────────────────────────
export function useLoginUser() {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  });
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  });
}

export function useGetMe(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getGetMeQueryKey(),
    queryFn: () => apiFetch('/api/auth/me'),
    ...query,
  });
}

// ─── Categories ─────────────────────────────────────────────────────────────
export function useListCategories(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getListCategoriesQueryKey(),
    queryFn: () => apiFetch('/api/categories'),
    ...query,
  });
}

export function useCreateCategory() {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  });
}

export function useUpdateCategory() {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  });
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: ({ id }) => apiFetch(`/api/categories/${id}`, { method: 'DELETE' }),
  });
}

// ─── Products ───────────────────────────────────────────────────────────────
export function useListProducts(params = {}, options = {}) {
  const { query = {} } = options;
  // Allow useListProducts({ page, limit, ... }) OR useListProducts(params, { query })
  const actualParams = typeof params === 'object' && !('query' in params) ? params : {};
  return useQuery({
    queryKey: getListProductsQueryKey(actualParams),
    queryFn: () => apiFetch(`/api/products${toQueryString(actualParams)}`),
    ...query,
  });
}

export function useGetFeaturedProducts(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => apiFetch('/api/products/featured'),
    ...query,
  });
}

export function useGetOfferProducts(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: ['products', 'offers'],
    queryFn: () => apiFetch('/api/products/offers'),
    ...query,
  });
}

export function useGetProduct(id, options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getGetProductQueryKey(id),
    queryFn: () => apiFetch(`/api/products/${id}`),
    enabled: !!id,
    ...query,
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  });
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: ({ id }) => apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
  });
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export function useGetCart(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getGetCartQueryKey(),
    queryFn: () => apiFetch('/api/cart'),
    ...query,
  });
}

export function useAddToCart() {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch('/api/cart/items', { method: 'POST', body: JSON.stringify(data) }),
  });
}

// itemId is the product's MongoDB ID (server uses productId as the cart item key)
export function useUpdateCartItem() {
  return useMutation({
    mutationFn: ({ itemId, data }) =>
      apiFetch(`/api/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  });
}

export function useRemoveFromCart() {
  return useMutation({
    mutationFn: ({ itemId }) => apiFetch(`/api/cart/items/${itemId}`, { method: 'DELETE' }),
  });
}

export function useClearCart() {
  return useMutation({
    mutationFn: () => apiFetch('/api/cart', { method: 'DELETE' }),
  });
}

// ─── Wishlist ────────────────────────────────────────────────────────────────
export function useGetWishlist(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getGetWishlistQueryKey(),
    queryFn: () => apiFetch('/api/wishlist'),
    ...query,
  });
}

export function useAddToWishlist() {
  return useMutation({
    mutationFn: ({ productId }) =>
      apiFetch('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  });
}

export function useRemoveFromWishlist() {
  return useMutation({
    mutationFn: ({ productId }) => apiFetch(`/api/wishlist/${productId}`, { method: 'DELETE' }),
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export function useListOrders(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiFetch('/api/orders'),
    ...query,
  });
}

export function useGetOrder(id, options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getGetOrderQueryKey(id),
    queryFn: () => apiFetch(`/api/orders/${id}`),
    enabled: !!id,
    ...query,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export function useListReviews(productId, options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getListReviewsQueryKey(productId),
    queryFn: () => apiFetch(`/api/products/${productId}/reviews`),
    enabled: !!productId,
    ...query,
  });
}

export function useCreateReview() {
  return useMutation({
    mutationFn: ({ productId, data }) =>
      apiFetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function useGetUserProfile(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getGetUserProfileQueryKey(),
    queryFn: () => apiFetch('/api/users/profile'),
    ...query,
  });
}

export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export function useGetAdminStats(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch('/api/admin/stats'),
    ...query,
  });
}

export function useListAllOrders(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: getListAllOrdersQueryKey(),
    queryFn: () => apiFetch('/api/admin/orders'),
    ...query,
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  });
}

export function useListAllUsers(options = {}) {
  const { query = {} } = options;
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiFetch('/api/admin/users'),
    ...query,
  });
}
