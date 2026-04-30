import { Router, type IRouter } from "express";
import { db, accountsTable } from "@workspace/db";
import { EnsureAccountBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/ensure", async (req, res) => {
  const parsed = EnsureAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "Invalid email" });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  await db
    .insert(accountsTable)
    .values({ email })
    .onConflictDoNothing({ target: accountsTable.email });
  res.json({ ok: true });
});

export default router;
