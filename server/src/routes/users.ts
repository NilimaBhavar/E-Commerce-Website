import { Router, type IRouter } from "express";
import { db, usersTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { UpdateUserProfileBody, GetUserProfileResponse } from "../schemas/index.js";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetUserProfileResponse.parse({ ...user, createdAt: user.createdAt.toISOString() }));
});

router.patch("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, req.user!.userId)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetUserProfileResponse.parse({ ...user, createdAt: user.createdAt.toISOString() }));
});

export default router;
