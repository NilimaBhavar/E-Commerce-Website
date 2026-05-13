import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, ordersTable, orderItemsTable, categoriesTable } from "../db/index.js";
import { eq, desc, sql, count } from "drizzle-orm";
import { ListAllOrdersQueryParams, UpdateOrderStatusParams, UpdateOrderStatusBody } from "../schemas/index.js";
import { requireAdmin } from "../middleware/auth.js";

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

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [[{ totalUsers }], [{ totalProducts }], [{ totalOrders }], [{ totalRevenue }]] = await Promise.all([
    db.select({ totalUsers: count() }).from(usersTable),
    db.select({ totalProducts: count() }).from(productsTable),
    db.select({ totalOrders: count() }).from(ordersTable),
    db.select({ totalRevenue: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable),
  ]);
  const recentOrdersRaw = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
  const recentOrders = await Promise.all(recentOrdersRaw.map(formatOrder));
  const cats = await db.select().from(categoriesTable);
  const topCategories = await Promise.all(cats.map(async (c) => {
    const [{ cnt }] = await db.select({ cnt: count() }).from(productsTable).where(eq(productsTable.categoryId, c.id));
    const [{ rev }] = await db.select({ rev: sql<number>`coalesce(sum(oi.price::numeric * oi.quantity), 0)` })
      .from(orderItemsTable)
      .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .where(eq(productsTable.categoryId, c.id));
    return { name: c.name, productCount: cnt ?? 0, revenue: Number(rev ?? 0) };
  }));
  const statusRows = await db.select({ status: ordersTable.status, cnt: count() }).from(ordersTable).groupBy(ordersTable.status);
  const ordersByStatus = statusRows.map((r) => ({ status: r.status, count: r.cnt }));
  const monthRows = await db.execute(sql`
    SELECT to_char(created_at, 'Mon YYYY') as month,
           coalesce(sum(total::numeric), 0) as revenue,
           count(*)::int as orders
    FROM orders
    GROUP BY to_char(created_at, 'Mon YYYY'), date_trunc('month', created_at)
    ORDER BY date_trunc('month', created_at) DESC
    LIMIT 6
  `);
  const revenueByMonth = (monthRows.rows as { month: string; revenue: string; orders: number }[]).map((r) => ({
    month: r.month,
    revenue: Number(r.revenue),
    orders: r.orders,
  }));
  res.json({ totalUsers, totalProducts, totalOrders, totalRevenue: Number(totalRevenue), recentOrders, topCategories, ordersByStatus, revenueByMonth });
});

router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ListAllOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  const formatted = await Promise.all(orders.map(formatOrder));
  res.json(formatted);
});

router.patch("/admin/orders/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const formatted = await formatOrder(order);
  res.json(formatted);
});

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })));
});

export default router;
