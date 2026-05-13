import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "../db/index.js";
import { eq, ilike, gte, lte, and, desc, asc, sql } from "drizzle-orm";
import { ListProductsQueryParams, CreateProductBody, UpdateProductBody, GetProductParams, UpdateProductParams, DeleteProductParams } from "../schemas/index.js";
import { requireAdmin } from "../middleware/auth.js";

const router: IRouter = Router();

function makeSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
}

async function formatProduct(p: typeof productsTable.$inferSelect) {
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, p.categoryId));
  return {
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    rating: Number(p.rating),
    categoryName: cat?.name ?? "",
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).where(eq(productsTable.isFeatured, true)).limit(12);
  const formatted = await Promise.all(products.map(formatProduct));
  res.json(formatted);
});

router.get("/products/offers", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(sql`${productsTable.discount} IS NOT NULL AND ${productsTable.discount} > 0`)
    .orderBy(desc(productsTable.discount))
    .limit(12);
  const formatted = await Promise.all(products.map(formatProduct));
  res.json(formatted);
});

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page = 1, limit = 12, categoryId, search, minPrice, maxPrice, sortBy, inStock } = parsed.data;
  const offset = (page - 1) * limit;
  const conditions = [];
  if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (minPrice !== undefined) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice !== undefined) conditions.push(lte(productsTable.price, String(maxPrice)));
  if (inStock) conditions.push(gte(productsTable.stock, 1));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const orderMap: Record<string, ReturnType<typeof asc>> = {
    "price-asc": asc(productsTable.price),
    "price-desc": desc(productsTable.price),
    "rating": desc(productsTable.rating),
    "newest": desc(productsTable.createdAt),
  };
  const orderBy = sortBy && orderMap[sortBy] ? orderMap[sortBy] : desc(productsTable.createdAt);
  const [products, [{ total }]] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(productsTable).where(where),
  ]);
  const formatted = await Promise.all(products.map(formatProduct));
  res.json({ products: formatted, total: total ?? 0, page, limit, totalPages: Math.ceil((total ?? 0) / limit) });
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const slug = makeSlug(parsed.data.name);
  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    slug,
    price: String(parsed.data.price),
    originalPrice: parsed.data.originalPrice != null ? String(parsed.data.originalPrice) : null,
  }).returning();
  const formatted = await formatProduct(product);
  res.status(201).json(formatted);
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const formatted = await formatProduct(product);
  res.json(formatted);
});

router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) updates.price = String(parsed.data.price);
  if (parsed.data.originalPrice !== undefined) updates.originalPrice = String(parsed.data.originalPrice);
  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const formatted = await formatProduct(product);
  res.json(formatted);
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
