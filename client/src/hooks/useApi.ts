import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, categoriesApi, productsApi, cartApi, wishlistApi, ordersApi, reviewsApi, usersApi, adminApi } from "@/services/api";

export const getGetMeQueryKey = () => ["me"] as const;
export const getGetCartQueryKey = () => ["cart"] as const;
export const getGetWishlistQueryKey = () => ["wishlist"] as const;
export const getListCategoriesQueryKey = () => ["categories"] as const;
export const getListProductsQueryKey = (params?: object) => ["products", "list", params] as const;
export const getGetProductQueryKey = (id: number) => ["products", id] as const;
export const getGetFeaturedProductsQueryKey = () => ["products", "featured"] as const;
export const getGetOfferProductsQueryKey = () => ["products", "offers"] as const;
export const getListOrdersQueryKey = () => ["orders"] as const;
export const getGetOrderQueryKey = (id: number) => ["orders", id] as const;
export const getListReviewsQueryKey = (productId: number) => ["reviews", productId] as const;
export const getGetUserProfileQueryKey = () => ["user-profile"] as const;
export const getGetAdminStatsQueryKey = () => ["admin-stats"] as const;
export const getListAllOrdersQueryKey = () => ["admin-orders"] as const;
export const getListAllUsersQueryKey = () => ["admin-users"] as const;

type QueryOptions = { enabled?: boolean; retry?: boolean | number; queryKey?: readonly unknown[] };
type WithQuery = { query?: QueryOptions };

export function useGetMe(options?: WithQuery) {
  return useQuery({
    queryKey: getGetMeQueryKey(),
    queryFn: authApi.me,
    ...options?.query,
  });
}

export function useListCategories(options?: WithQuery) {
  return useQuery({
    queryKey: getListCategoriesQueryKey(),
    queryFn: categoriesApi.list,
    ...options?.query,
  });
}

export function useGetCategory(id: number, options?: WithQuery) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => categoriesApi.get(id),
    enabled: !!id,
    ...options?.query,
  });
}

export function useListProducts(params?: {
  page?: number; limit?: number; categoryId?: number; search?: string;
  minPrice?: number; maxPrice?: number; sortBy?: string; inStock?: boolean;
}) {
  return useQuery({
    queryKey: getListProductsQueryKey(params),
    queryFn: () => productsApi.list(params),
  });
}

export function useGetFeaturedProducts(options?: WithQuery) {
  return useQuery({
    queryKey: getGetFeaturedProductsQueryKey(),
    queryFn: productsApi.featured,
    ...options?.query,
  });
}

export function useGetOfferProducts(options?: WithQuery) {
  return useQuery({
    queryKey: getGetOfferProductsQueryKey(),
    queryFn: productsApi.offers,
    ...options?.query,
  });
}

export function useGetProduct(id: number, options?: WithQuery) {
  return useQuery({
    queryKey: getGetProductQueryKey(id),
    queryFn: () => productsApi.get(id),
    enabled: !!id,
    ...options?.query,
  });
}

export function useGetCart(options?: WithQuery) {
  return useQuery({
    queryKey: getGetCartQueryKey(),
    queryFn: cartApi.get,
    ...options?.query,
  });
}

export function useGetWishlist(options?: WithQuery) {
  return useQuery({
    queryKey: getGetWishlistQueryKey(),
    queryFn: wishlistApi.get,
    ...options?.query,
  });
}

export function useListOrders(options?: WithQuery) {
  return useQuery({
    queryKey: getListOrdersQueryKey(),
    queryFn: ordersApi.list,
    ...options?.query,
  });
}

export function useGetOrder(id: number, options?: WithQuery) {
  return useQuery({
    queryKey: getGetOrderQueryKey(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
    ...options?.query,
  });
}

export function useListReviews(productId: number, options?: WithQuery) {
  return useQuery({
    queryKey: getListReviewsQueryKey(productId),
    queryFn: () => reviewsApi.list(productId),
    enabled: !!productId,
    ...options?.query,
  });
}

export function useGetUserProfile(options?: WithQuery) {
  return useQuery({
    queryKey: getGetUserProfileQueryKey(),
    queryFn: usersApi.getProfile,
    ...options?.query,
  });
}

export function useGetAdminStats(options?: WithQuery) {
  return useQuery({
    queryKey: getGetAdminStatsQueryKey(),
    queryFn: adminApi.getStats,
    ...options?.query,
  });
}

export function useListAllOrders(options?: WithQuery) {
  return useQuery({
    queryKey: getListAllOrdersQueryKey(),
    queryFn: adminApi.listOrders,
    ...options?.query,
  });
}

export function useListAllUsers(options?: WithQuery) {
  return useQuery({
    queryKey: getListAllUsersQueryKey(),
    queryFn: adminApi.listUsers,
    ...options?.query,
  });
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: ({ data }: { data: { name: string; email: string; password: string; phone?: string } }) =>
      authApi.register(data),
  });
}

export function useLoginUser() {
  return useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string } }) =>
      authApi.login(data),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: { name: string; description?: string; imageUrl?: string } }) =>
      categoriesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: { name?: string; description?: string; imageUrl?: string } }) =>
      categoriesApi.update(categoryId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId }: { categoryId: number }) =>
      categoriesApi.delete(categoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: {
      name: string; description?: string; price: number; originalPrice?: number;
      categoryId: number; brand?: string; stock: number; imageUrl: string;
      images?: string[]; isFeatured?: boolean; tags?: string[];
    } }) => productsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: {
      name?: string; description?: string; price?: number; originalPrice?: number;
      categoryId?: number; brand?: string; stock?: number; imageUrl?: string; isFeatured?: boolean;
    } }) => productsApi.update(productId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId }: { productId: number }) => productsApi.delete(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: { productId: number; quantity: number } }) =>
      cartApi.addItem(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: { quantity: number } }) =>
      cartApi.updateItem(itemId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId }: { itemId: number }) => cartApi.removeItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId }: { productId: number }) => wishlistApi.add(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() }),
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId }: { productId: number }) => wishlistApi.remove(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() }),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: {
      shippingAddress: string; city?: string; state?: string;
      pincode?: string; paymentMethod: string; notes?: string;
    } }) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: { rating: number; comment?: string } }) =>
      reviewsApi.create(productId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey(variables.productId) });
      queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(variables.productId) });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: {
      name?: string; phone?: string; address?: string;
      city?: string; state?: string; pincode?: string;
    } }) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: { status: string } }) =>
      adminApi.updateOrderStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAllOrdersQueryKey() });
    },
  });
}
