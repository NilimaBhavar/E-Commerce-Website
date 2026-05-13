import { Router, type IRouter } from "express";
import { db, wishlistItemsTable, productsTable } from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { AddToWishlistParams, RemoveFromWishlistParams } from "../schemas/index.js";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const items = await db.select().from(wishlistItemsTable).where(eq(wishlistItemsTable.userId, req.user!.userId));
  const enriched = await Promise.all(items.map(async (item) => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    return {
      id: item.id,
      productId: item.productId,
      productName: product?.name ?? "",
      price: Number(product?.price ?? 0),
      originalPrice: product?.originalPrice != null ? Number(product.originalPrice) : null,
      discount: product?.discount ?? null,
      imageUrl: product?.imageUrl ?? "",
      stock: product?.stock ?? 0,
      rating: Number(product?.rating ?? 0),
      addedAt: item.createdAt.toISOString(),
    };
  }));
  res.json(enriched);
});

router.post("/wishlist/:productId", requireAuth, async (req, res): Promise<void> => {
  const params = AddToWishlistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.user!.userId;
  const productId = params.data.productId;
  const [existing] = await db.select().from(wishlistItemsTable).where(and(eq(wishlistItemsTable.userId, userId), eq(wishlistItemsTable.productId, productId)));
  if (existing) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    res.json({
      id: existing.id,
      productId,
      productName: product?.name ?? "",
      price: Number(product?.price ?? 0),
      originalPrice: product?.originalPrice != null ? Number(product.originalPrice) : null,
      discount: product?.discount ?? null,
      imageUrl: product?.imageUrl ?? "",
      stock: product?.stock ?? 0,
      rating: Number(product?.rating ?? 0),
      addedAt: existing.createdAt.toISOString(),
    });
    return;
  }
  const [item] = await db.insert(wishlistItemsTable).values({ userId, productId }).returning();
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  res.json({
    id: item.id,
    productId,
    productName: product?.name ?? "",
    price: Number(product?.price ?? 0),
    originalPrice: product?.originalPrice != null ? Number(product.originalPrice) : null,
    discount: product?.discount ?? null,
    imageUrl: product?.imageUrl ?? "",
    stock: product?.stock ?? 0,
    rating: Number(product?.rating ?? 0),
    addedAt: item.createdAt.toISOString(),
  });
});

router.delete("/wishlist/:productId", requireAuth, async (req, res): Promise<void> => {
  const params = RemoveFromWishlistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(wishlistItemsTable).where(and(eq(wishlistItemsTable.userId, req.user!.userId), eq(wishlistItemsTable.productId, params.data.productId)));
  res.sendStatus(204);
});

export default router;
