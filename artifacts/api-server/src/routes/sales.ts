import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, productsTable, salesTable } from "@workspace/db";
import {
  CreateSaleBody as SaleInputSchema,
  UpdateSaleBody as SaleUpdateSchema,
} from "@workspace/api-zod";

const router: IRouter = Router();

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function parseSaleDate(input: unknown): Date {
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;
  if (typeof input === "string" && input.length > 0) {
    const d = new Date(input);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
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
  const { pid, qty, price, disc, note, date } = parsed.data;
  const saleDate = parseSaleDate(date);

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
        date: saleDate,
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

router.patch("/shops/:email/sales/:id", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const id = req.params.id;
  const parsed = SaleUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid sale input" });
    return;
  }
  const { pid, qty, price, disc, note, date } = parsed.data;

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(salesTable)
      .where(
        and(eq(salesTable.id, id), eq(salesTable.shopEmail, email)),
      );
    if (!existing) {
      return { error: "Sale not found" } as const;
    }
    const saleDate = date ? parseSaleDate(date) : existing.date;

    const [newProduct] = await tx
      .select()
      .from(productsTable)
      .where(
        and(eq(productsTable.id, pid), eq(productsTable.shopEmail, email)),
      );
    if (!newProduct) {
      return { error: "Product not found" } as const;
    }

    const oldQty = Number(existing.qty);
    const samePid = existing.pid === pid;

    if (samePid) {
      const available = Number(newProduct.stock) + oldQty;
      if (available < qty) {
        return {
          error: `Insufficient stock. Only ${available} available.`,
        } as const;
      }
      const delta = qty - oldQty;
      if (delta !== 0) {
        await tx
          .update(productsTable)
          .set({
            stock: sql`${productsTable.stock} - ${delta}`,
            updatedAt: new Date(),
          })
          .where(eq(productsTable.id, pid));
      }
    } else {
      if (Number(newProduct.stock) < qty) {
        return {
          error: `Insufficient stock. Only ${Number(newProduct.stock)} available.`,
        } as const;
      }
      await tx
        .update(productsTable)
        .set({
          stock: sql`${productsTable.stock} + ${oldQty}`,
          updatedAt: new Date(),
        })
        .where(eq(productsTable.id, existing.pid));
      await tx
        .update(productsTable)
        .set({
          stock: sql`${productsTable.stock} - ${qty}`,
          updatedAt: new Date(),
        })
        .where(eq(productsTable.id, pid));
    }

    const buy = Number(newProduct.buy);
    const total = Math.max(0, qty * price - (disc ?? 0));
    const profit = total - buy * qty;

    const [row] = await tx
      .update(salesTable)
      .set({
        pid,
        pname: newProduct.name,
        qty,
        price,
        buy,
        disc: disc ?? 0,
        total,
        profit,
        note: note ?? null,
        date: saleDate,
      })
      .where(
        and(eq(salesTable.id, id), eq(salesTable.shopEmail, email)),
      )
      .returning();
    return { sale: row } as const;
  });

  if ("error" in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(toSaleDto(result.sale));
});

router.delete("/shops/:email/sales/:id", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const id = req.params.id;

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(salesTable)
      .where(
        and(eq(salesTable.id, id), eq(salesTable.shopEmail, email)),
      );
    if (!existing) {
      return { ok: true } as const;
    }
    await tx
      .update(productsTable)
      .set({
        stock: sql`${productsTable.stock} + ${Number(existing.qty)}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productsTable.id, existing.pid),
          eq(productsTable.shopEmail, email),
        ),
      );
    await tx
      .delete(salesTable)
      .where(
        and(eq(salesTable.id, id), eq(salesTable.shopEmail, email)),
      );
    return { ok: true } as const;
  });

  void result;
  res.status(204).end();
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
