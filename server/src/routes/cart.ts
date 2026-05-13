import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveFromCartParams } from "../schemas/index.js";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

async function getCartResponse(userId: number) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const enriched = await Promise.all(items.map(async (item) => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    return {
      id: item.id,
      productId: item.productId,
      productName: product?.name ?? "",
      price: Number(product?.price ?? 0),
      quantity: item.quantity,
      imageUrl: product?.imageUrl ?? "",
      stock: product?.stock ?? 0,
    };
  }));
  const subtotal = enriched.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = enriched.reduce((sum, item) => sum + item.quantity, 0);
  return { items: enriched, subtotal, itemCount };
}

router.get("/cart", requireAuth, async (req, res): Promise<void> => {
  const cart = await getCartResponse(req.user!.userId);
  res.json(cart);
});

router.post("/cart/items", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { productId, quantity } = parsed.data;
  const userId = req.user!.userId;
  const [existing] = await db.select().from(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  if (existing) {
    await db.update(cartItemsTable).set({ quantity: existing.quantity + quantity }).where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity });
  }
  const cart = await getCartResponse(userId);
  res.json(cart);
});

router.patch("/cart/items/:productId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.user!.userId;
  if (parsed.data.quantity <= 0) {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, params.data.productId)));
  } else {
    await db.update(cartItemsTable).set({ quantity: parsed.data.quantity }).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, params.data.productId)));
  }
  const cart = await getCartResponse(userId);
  res.json(cart);
});

router.delete("/cart/items/:productId", requireAuth, async (req, res): Promise<void> => {
  const params = RemoveFromCartParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.user!.userId;
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, params.data.productId)));
  const cart = await getCartResponse(userId);
  res.json(cart);
});

router.delete("/cart", requireAuth, async (req, res): Promise<void> => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.user!.userId));
  res.json({ items: [], subtotal: 0, itemCount: 0 });
});

export default router;
