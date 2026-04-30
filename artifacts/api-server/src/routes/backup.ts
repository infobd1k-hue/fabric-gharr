import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, expensesTable, productsTable, salesTable } from "@workspace/db";
import {
  RestoreBackupBody as BackupSnapshotSchema,
} from "@workspace/api-zod";
import { toSaleDto } from "./sales";
import { toExpenseDto } from "./expenses";

const router: IRouter = Router();

router.get("/shops/:email/backup", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const [products, sales, expenses] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.shopEmail, email)),
    db.select().from(salesTable).where(eq(salesTable.shopEmail, email)),
    db.select().from(expensesTable).where(eq(expensesTable.shopEmail, email)),
  ]);

  res.json({
    exportedAt: new Date().toISOString(),
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      cat: p.cat,
      buy: Number(p.buy),
      sell: Number(p.sell),
      stock: Number(p.stock),
    })),
    sales: sales.map(toSaleDto),
    expenses: expenses.map(toExpenseDto),
  });
});

router.post("/shops/:email/restore", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const parsed = BackupSnapshotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid backup snapshot" });
    return;
  }
  const { products, sales, expenses } = parsed.data;

  await db.transaction(async (tx) => {
    await tx.delete(salesTable).where(eq(salesTable.shopEmail, email));
    await tx.delete(productsTable).where(eq(productsTable.shopEmail, email));
    await tx.delete(expensesTable).where(eq(expensesTable.shopEmail, email));

    if (products.length > 0) {
      await tx.insert(productsTable).values(
        products.map((p) => ({
          id: p.id,
          shopEmail: email,
          name: p.name,
          cat: p.cat,
          buy: p.buy,
          sell: p.sell,
          stock: p.stock,
        })),
      );
    }
    if (sales.length > 0) {
      await tx.insert(salesTable).values(
        sales.map((s) => ({
          id: s.id,
          shopEmail: email,
          date: new Date(s.date),
          pid: s.pid,
          pname: s.pname,
          qty: s.qty,
          price: s.price,
          buy: s.buy,
          disc: s.disc,
          total: s.total,
          profit: s.profit,
          note: s.note ?? null,
        })),
      );
    }
    if (expenses && expenses.length > 0) {
      await tx.insert(expensesTable).values(
        expenses.map((e) => ({
          id: e.id,
          shopEmail: email,
          date: new Date(e.date),
          cat: e.cat,
          amount: e.amount,
          note: e.note ?? null,
        })),
      );
    }
  });

  res.json({
    products: products.length,
    sales: sales.length,
    expenses: expenses?.length ?? 0,
  });
});

export default router;
