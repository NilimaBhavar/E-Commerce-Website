import * as zod from "zod";

export const RegisterUserBody = zod.object({
  name: zod.string().min(2),
  email: zod.string().email(),
  password: zod.string().min(6),
  phone: zod.string().optional(),
});

export const LoginUserBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

export const GetMeResponse = zod.object({
  id: zod.number(),
  name: zod.string(),
  email: zod.string(),
  phone: zod.string().nullish(),
  role: zod.enum(["user", "admin"]),
  avatar: zod.string().nullish(),
  address: zod.string().nullish(),
  city: zod.string().nullish(),
  state: zod.string().nullish(),
  pincode: zod.string().nullish(),
  createdAt: zod.string(),
});

export const GetUserProfileResponse = zod.object({
  id: zod.number(),
  name: zod.string(),
  email: zod.string(),
  phone: zod.string().nullish(),
  role: zod.enum(["user", "admin"]),
  avatar: zod.string().nullish(),
  address: zod.string().nullish(),
  city: zod.string().nullish(),
  state: zod.string().nullish(),
  pincode: zod.string().nullish(),
  createdAt: zod.string(),
});

export const UpdateUserProfileBody = zod.object({
  name: zod.string().optional(),
  phone: zod.string().optional(),
  address: zod.string().optional(),
  city: zod.string().optional(),
  state: zod.string().optional(),
  pincode: zod.string().optional(),
});

export const CreateCategoryBody = zod.object({
  name: zod.string(),
  description: zod.string().optional(),
  imageUrl: zod.string().optional(),
});

export const UpdateCategoryBody = zod.object({
  name: zod.string().optional(),
  description: zod.string().optional(),
  imageUrl: zod.string().optional(),
});

export const GetCategoryParams = zod.object({ id: zod.coerce.number() });
export const UpdateCategoryParams = zod.object({ id: zod.coerce.number() });
export const DeleteCategoryParams = zod.object({ id: zod.coerce.number() });

export const ListProductsQueryParams = zod.object({
  page: zod.coerce.number().optional(),
  limit: zod.coerce.number().optional(),
  categoryId: zod.coerce.number().optional(),
  search: zod.coerce.string().optional(),
  minPrice: zod.coerce.number().optional(),
  maxPrice: zod.coerce.number().optional(),
  sortBy: zod.coerce.string().optional(),
  inStock: zod.coerce.boolean().optional(),
});

export const CreateProductBody = zod.object({
  name: zod.string(),
  description: zod.string().optional(),
  price: zod.number(),
  originalPrice: zod.number().optional(),
  categoryId: zod.number(),
  brand: zod.string().optional(),
  stock: zod.number(),
  imageUrl: zod.string(),
  images: zod.array(zod.string()).optional(),
  isFeatured: zod.boolean().optional(),
  tags: zod.array(zod.string()).optional(),
});

export const UpdateProductBody = zod.object({
  name: zod.string().optional(),
  description: zod.string().optional(),
  price: zod.number().optional(),
  originalPrice: zod.number().optional(),
  categoryId: zod.number().optional(),
  brand: zod.string().optional(),
  stock: zod.number().optional(),
  imageUrl: zod.string().optional(),
  isFeatured: zod.boolean().optional(),
});

export const GetProductParams = zod.object({ id: zod.coerce.number() });
export const UpdateProductParams = zod.object({ id: zod.coerce.number() });
export const DeleteProductParams = zod.object({ id: zod.coerce.number() });

export const AddToCartBody = zod.object({
  productId: zod.number(),
  quantity: zod.number(),
});

export const UpdateCartItemParams = zod.object({ productId: zod.coerce.number() });
export const UpdateCartItemBody = zod.object({ quantity: zod.number() });
export const RemoveFromCartParams = zod.object({ productId: zod.coerce.number() });

export const AddToWishlistParams = zod.object({ productId: zod.coerce.number() });
export const RemoveFromWishlistParams = zod.object({ productId: zod.coerce.number() });

export const CreateOrderBody = zod.object({
  shippingAddress: zod.string(),
  city: zod.string().optional(),
  state: zod.string().optional(),
  pincode: zod.string().optional(),
  paymentMethod: zod.string(),
  notes: zod.string().optional(),
});

export const GetOrderParams = zod.object({ id: zod.coerce.number() });

export const ListReviewsParams = zod.object({ productId: zod.coerce.number() });
export const CreateReviewParams = zod.object({ productId: zod.coerce.number() });
export const CreateReviewBody = zod.object({
  rating: zod.number().min(1).max(5),
  comment: zod.string().optional(),
});

export const ListAllOrdersQueryParams = zod.object({
  page: zod.coerce.number().optional(),
  status: zod.coerce.string().optional(),
});

export const UpdateOrderStatusParams = zod.object({ id: zod.coerce.number() });
export const UpdateOrderStatusBody = zod.object({
  status: zod.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});

export const HealthCheckResponse = zod.object({ status: zod.string() });
