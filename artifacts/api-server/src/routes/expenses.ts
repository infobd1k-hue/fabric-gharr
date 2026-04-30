import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, expensesTable } from "@workspace/db";
import { CreateExpenseBody as ExpenseInputSchema } from "@workspace/api-zod";

const router: IRouter = Router();

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

router.get("/shops/:email/expenses", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const rows = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.shopEmail, email))
    .orderBy(desc(expensesTable.date));
  res.json(rows.map(toExpenseDto));
});

router.post("/shops/:email/expenses", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const parsed = ExpenseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid expense input" });
    return;
  }
  const { cat, amount, note, date } = parsed.data;
  const dateValue = date ? new Date(date) : new Date();

  const [row] = await db
    .insert(expensesTable)
    .values({
      id: makeId(),
      shopEmail: email,
      date: dateValue,
      cat: cat.trim(),
      amount,
      note: note?.trim() || null,
    })
    .returning();
  res.status(201).json(toExpenseDto(row));
});

router.delete("/shops/:email/expenses/:id", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const id = req.params.id;
  await db
    .delete(expensesTable)
    .where(and(eq(expensesTable.id, id), eq(expensesTable.shopEmail, email)));
  res.status(204).end();
});

export function toExpenseDto(row: typeof expensesTable.$inferSelect) {
  return {
    id: row.id,
    date: row.date.toISOString(),
    cat: row.cat,
    amount: Number(row.amount),
    note: row.note ?? undefined,
  };
}

export default router;
