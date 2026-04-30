import {
  pgTable,
  text,
  doublePrecision,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const accountsTable = pgTable("accounts", {
  email: text("email").primaryKey(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Account = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;

export const productsTable = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    shopEmail: text("shop_email").notNull(),
    name: text("name").notNull(),
    cat: text("cat").notNull(),
    buy: doublePrecision("buy").notNull().default(0),
    sell: doublePrecision("sell").notNull().default(0),
    stock: doublePrecision("stock").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("products_shop_email_idx").on(t.shopEmail)],
);

export const salesTable = pgTable(
  "sales",
  {
    id: text("id").primaryKey(),
    shopEmail: text("shop_email").notNull(),
    date: timestamp("date").notNull().defaultNow(),
    pid: text("pid").notNull(),
    pname: text("pname").notNull(),
    qty: doublePrecision("qty").notNull(),
    price: doublePrecision("price").notNull(),
    buy: doublePrecision("buy").notNull(),
    disc: doublePrecision("disc").notNull().default(0),
    total: doublePrecision("total").notNull(),
    profit: doublePrecision("profit").notNull(),
    note: text("note"),
  },
  (t) => [index("sales_shop_email_idx").on(t.shopEmail)],
);

export const expensesTable = pgTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    shopEmail: text("shop_email").notNull(),
    date: timestamp("date").notNull().defaultNow(),
    cat: text("cat").notNull(),
    amount: doublePrecision("amount").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("expenses_shop_email_idx").on(t.shopEmail)],
);

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
export type Sale = typeof salesTable.$inferSelect;
export type InsertSale = typeof salesTable.$inferInsert;
export type Expense = typeof expensesTable.$inferSelect;
export type InsertExpense = typeof expensesTable.$inferInsert;
