import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable, usersTable } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "../schemas/index.js";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

async function formatOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, order.userId));
  return {
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    userName: user?.name ?? null,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      price: Number(i.price),
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.user!.userId)).orderBy(desc(ordersTable.createdAt));
  const formatted = await Promise.all(orders.map(formatOrder));
  res.json(formatted);
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.user!.userId;
  const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }
  let subtotal = 0;
  const orderItemsData = [];
  for (const item of cartItems) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) continue;
    const price = Number(product.price);
    subtotal += price * item.quantity;
    orderItemsData.push({ productId: item.productId, productName: product.name, price: String(price), quantity: item.quantity, imageUrl: product.imageUrl });
  }
  const shippingFee = subtotal >= 500 ? 0 : 40;
  const total = subtotal + shippingFee;
  const [order] = await db.insert(ordersTable).values({
    userId,
    total: String(total),
    subtotal: String(subtotal),
    shippingFee: String(shippingFee),
    paymentMethod: parsed.data.paymentMethod,
    paymentStatus: "pending",
    shippingAddress: parsed.data.shippingAddress,
    city: parsed.data.city ?? null,
    state: parsed.data.state ?? null,
    pincode: parsed.data.pincode ?? null,
    notes: parsed.data.notes ?? null,
  }).returning();
  await db.insert(orderItemsTable).values(orderItemsData.map((i) => ({ orderId: order.id, ...i })));
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const formatted = await formatOrder(order);
  res.status(201).json(formatted);
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order || order.userId !== req.user!.userId) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const formatted = await formatOrder(order);
  res.json(formatted);
});

export default router;
