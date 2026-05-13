import { Router, type IRouter } from "express";
import { db, reviewsTable, usersTable, productsTable } from "@workspace/db";
import { eq, avg, count } from "drizzle-orm";
import { ListReviewsParams, CreateReviewParams, CreateReviewBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/products/:productId/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, params.data.productId));
  const enriched = await Promise.all(reviews.map(async (r) => {
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, r.userId));
    return { ...r, userName: user?.name ?? "Anonymous", createdAt: r.createdAt.toISOString() };
  }));
  res.json(enriched);
});

router.post("/products/:productId/reviews", requireAuth, async (req, res): Promise<void> => {
  const params = CreateReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.user!.userId;
  const productId = params.data.productId;
  const [review] = await db.insert(reviewsTable).values({ productId, userId, rating: parsed.data.rating, comment: parsed.data.comment ?? null }).returning();
  const [{ avgRating, total }] = await db.select({ avgRating: avg(reviewsTable.rating), total: count() }).from(reviewsTable).where(eq(reviewsTable.productId, productId));
  await db.update(productsTable).set({ rating: String(Number(avgRating ?? 0).toFixed(2)), reviewCount: total }).where(eq(productsTable.id, productId));
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...review, userName: user?.name ?? "Anonymous", createdAt: review.createdAt.toISOString() });
});

export default router;
