import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  CreateProductBody as ProductInputSchema,
} from "@workspace/api-zod";

const router: IRouter = Router();

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

router.get("/shops/:email/products", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.shopEmail, email))
    .orderBy(asc(productsTable.name));
  res.json(rows.map(toProductDto));
});

router.post("/shops/:email/products", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const parsed = ProductInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product input" });
    return;
  }
  const id = makeId();
  const [row] = await db
    .insert(productsTable)
    .values({
      id,
      shopEmail: email,
      name: parsed.data.name,
      cat: parsed.data.cat,
      buy: parsed.data.buy,
      sell: parsed.data.sell,
      stock: parsed.data.stock,
    })
    .returning();
  res.status(201).json(toProductDto(row));
});

router.patch("/shops/:email/products/:id", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const id = req.params.id;
  const parsed = ProductInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product input" });
    return;
  }
  const [row] = await db
    .update(productsTable)
    .set({
      name: parsed.data.name,
      cat: parsed.data.cat,
      buy: parsed.data.buy,
      sell: parsed.data.sell,
      stock: parsed.data.stock,
      updatedAt: new Date(),
    })
    .where(and(eq(productsTable.id, id), eq(productsTable.shopEmail, email)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(toProductDto(row));
});

router.delete("/shops/:email/products/:id", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const id = req.params.id;
  await db
    .delete(productsTable)
    .where(and(eq(productsTable.id, id), eq(productsTable.shopEmail, email)));
  res.status(204).end();
});

function toProductDto(row: typeof productsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    buy: Number(row.buy),
    sell: Number(row.sell),
    stock: Number(row.stock),
  };
}

export default router;
