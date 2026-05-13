import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody, UpdateCategoryBody, GetCategoryParams, UpdateCategoryParams, DeleteCategoryParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth.js";

const router: IRouter = Router();

function makeSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function getCategoryWithCount(id: number) {
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!cat) return null;
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.categoryId, id));
  return { ...cat, productCount: count ?? 0 };
}

router.get("/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  const withCounts = await Promise.all(cats.map(async (c) => {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.categoryId, c.id));
    return { ...c, productCount: count ?? 0 };
  }));
  res.json(withCounts);
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const slug = makeSlug(parsed.data.name);
  const [cat] = await db.insert(categoriesTable).values({ ...parsed.data, slug }).returning();
  res.status(201).json({ ...cat, productCount: 0 });
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const params = GetCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const cat = await getCategoryWithCount(params.data.id);
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(cat);
});

router.patch("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) updates.slug = makeSlug(parsed.data.name);
  const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const result = await getCategoryWithCount(cat.id);
  res.json(result);
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
