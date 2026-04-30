import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, expensesTable, productsTable, salesTable } from "@workspace/db";
import { toSaleDto } from "./sales";

const router: IRouter = Router();

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

router.get("/shops/:email/dashboard", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const [products, sales] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.shopEmail, email)),
    db.select().from(salesTable).where(eq(salesTable.shopEmail, email)),
  ]);

  const today = new Date().toDateString();
  const todaySalesRows = sales.filter(
    (s) => new Date(s.date).toDateString() === today,
  );
  const todayRevenue = todaySalesRows.reduce(
    (acc, s) => acc + Number(s.total),
    0,
  );
  const todayProfit = todaySalesRows.reduce(
    (acc, s) => acc + Number(s.profit),
    0,
  );
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total), 0);
  const totalProfit = sales.reduce((acc, s) => acc + Number(s.profit), 0);
  const lowStockCount = products.filter((p) => Number(p.stock) <= 5).length;

  const todaySalesSorted = [...todaySalesRows]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map(toSaleDto);

  res.json({
    todayRevenue,
    todayProfit,
    totalRevenue,
    totalProfit,
    productCount: products.length,
    lowStockCount,
    todaySales: todaySalesSorted,
  });
});

router.get("/shops/:email/report", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const sales = await db
    .select()
    .from(salesTable)
    .where(eq(salesTable.shopEmail, email));

  const totalRevenue = sales.reduce((a, s) => a + Number(s.total), 0);
  const totalCost = sales.reduce(
    (a, s) => a + Number(s.buy) * Number(s.qty),
    0,
  );
  const totalProfit = sales.reduce((a, s) => a + Number(s.profit), 0);
  const profitMargin =
    totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const monthMap = new Map<
    string,
    { revenue: number; profit: number; count: number }
  >();
  const prodMap = new Map<
    string,
    { revenue: number; profit: number; qty: number }
  >();

  for (const s of sales) {
    const k = ymd(new Date(s.date));
    const cur = monthMap.get(k) ?? { revenue: 0, profit: 0, count: 0 };
    cur.revenue += Number(s.total);
    cur.profit += Number(s.profit);
    cur.count += 1;
    monthMap.set(k, cur);

    const p = prodMap.get(s.pname) ?? { revenue: 0, profit: 0, qty: 0 };
    p.revenue += Number(s.total);
    p.profit += Number(s.profit);
    p.qty += Number(s.qty);
    prodMap.set(s.pname, p);
  }

  const byMonth = [...monthMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([month, v]) => ({ month, ...v }));

  const topProducts = [...prodMap.entries()]
    .sort((a, b) => b[1].profit - a[1].profit)
    .slice(0, 8)
    .map(([name, v]) => ({ name, ...v }));

  res.json({
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin,
    byMonth,
    topProducts,
  });
});

export default router;
