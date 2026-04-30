import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, productsTable, salesTable } from "@workspace/db";
import { CreateSaleBody as SaleInputSchema } from "@workspace/api-zod";

const router: IRouter = Router();

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

router.get("/shops/:email/sales", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const rows = await db
    .select()
    .from(salesTable)
    .where(eq(salesTable.shopEmail, email))
    .orderBy(desc(salesTable.date));
  res.json(rows.map(toSaleDto));
});

router.post("/shops/:email/sales", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const parsed = SaleInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid sale input" });
    return;
  }
  const { pid, qty, price, disc, note } = parsed.data;

  const result = await db.transaction(async (tx) => {
    const [product] = await tx
      .select()
      .from(productsTable)
      .where(
        and(eq(productsTable.id, pid), eq(productsTable.shopEmail, email)),
      );
    if (!product) {
      return { error: "Product not found" } as const;
    }
    const stock = Number(product.stock);
    if (stock < qty) {
      return {
        error: `Insufficient stock. Only ${stock} available.`,
      } as const;
    }
    const buy = Number(product.buy);
    const total = Math.max(0, qty * price - (disc ?? 0));
    const profit = total - buy * qty;

    await tx
      .update(productsTable)
      .set({
        stock: sql`${productsTable.stock} - ${qty}`,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, pid));

    const [row] = await tx
      .insert(salesTable)
      .values({
        id: makeId(),
        shopEmail: email,
        date: new Date(),
        pid,
        pname: product.name,
        qty,
        price,
        buy,
        disc: disc ?? 0,
        total,
        profit,
        note: note ?? null,
      })
      .returning();
    return { sale: row } as const;
  });

  if ("error" in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(201).json(toSaleDto(result.sale));
});

export function toSaleDto(row: typeof salesTable.$inferSelect) {
  return {
    id: row.id,
    date: row.date.toISOString(),
    pid: row.pid,
    pname: row.pname,
    qty: Number(row.qty),
    price: Number(row.price),
    buy: Number(row.buy),
    disc: Number(row.disc),
    total: Number(row.total),
    profit: Number(row.profit),
    note: row.note ?? undefined,
  };
}

export default router;
