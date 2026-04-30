# FabricGhar — সম্পূর্ণ সোর্স কোড

**প্রজেক্ট:** Bengali (Bangla) fabric shop management app
**স্ট্যাক:** Expo React Native (mobile) + Express 5 (API) + PostgreSQL/Drizzle + Orval-generated client
**থিম:** Dark mode (#0f0f13 background, #f5a623 accent)
**ডেটা স্কোপ:** User Gmail (shopEmail) দিয়ে সব ডেটা ভাগ হয়
**ভাষা:** UI সম্পূর্ণ বাংলায়

## ফোল্ডার গঠন (Monorepo — pnpm workspace)

```
.
├── artifacts/
│   ├── mobile/         # Expo React Native app
│   ├── api-server/     # Express 5 API
│   └── mockup-sandbox/ # Component preview (auto-generated)
├── lib/
│   ├── api-spec/       # OpenAPI definition + Orval codegen
│   ├── api-client-react/ # Generated React Query client
│   ├── api-zod/        # Generated Zod validators
│   └── db/             # Drizzle schema + connection
├── package.json
├── pnpm-workspace.yaml
└── replit.md
```

## নতুন ব্যবহারের সময় কী করবেন

1. **Replit এ নতুন project খুলে এই কোডগুলো একই ফোল্ডার গঠনে রাখুন।**
2. **PostgreSQL database সেটআপ করুন** (Replit এ "Database" tool থেকে)। `DATABASE_URL` automatically set হবে।
3. **Dependencies ইনস্টল:** `pnpm install`
4. **DB schema push:** `pnpm --filter @workspace/db run push`
5. **Workflows শুরু:** `api-server`, `mobile`, `mockup-sandbox` — তিনটাই চালু রাখুন।
6. কোনো API পরিবর্তন করলে: `pnpm --filter @workspace/api-spec run codegen` চালান।


---

# প্রজেক্ট রুট কনফিগ


## `package.json`

```json
{
  "name": "workspace",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "preinstall": "sh -c 'rm -f package-lock.json yarn.lock; case \"$npm_config_user_agent\" in pnpm/*) ;; *) echo \"Use pnpm instead\" >&2; exit 1 ;; esac'",
    "build": "pnpm run typecheck && pnpm -r --if-present run build",
    "typecheck:libs": "tsc --build",
    "typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./artifacts/**\" --filter \"./scripts\" --if-present run typecheck"
  },
  "private": true,
  "devDependencies": {
    "typescript": "~5.9.2",
    "prettier": "^3.8.1"
  }
}

```

## `pnpm-workspace.yaml`

```yaml
# ============================================================================
# SECURITY: Minimum release age for npm packages (supply-chain attack defense)
# ============================================================================
#
# This setting requires that any npm package version must have been published
# for at least 1 day (1440 minutes) before pnpm will allow installing it.
# This is a critical defense against supply-chain attacks. In most cases,
# malicious npm releases are discovered and pulled within hours, so a 1-day
# delay provides a strong safety buffer.
#
# DO NOT DISABLE THIS SETTING. Removing or setting it to 0 is considered
# extremely dangerous and leaves the entire workspace vulnerable to supply-
# chain attacks, which have been the #1 vector for npm ecosystem compromises.
#
# If you absolutely need to install a package before the 1-day window has
# passed (e.g. an urgent security bugfix), you can add it to the
# `minimumReleaseAgeExclude` allowlist below. Only consider doing this for
# packages released by trusted organizations with an impeccable security
# posture (e.g. Replit packsges, react from Meta, typescript from Microsoft). Even then,
# remove the exclusion once the 1-day window has passed.
#
# Example:
#   minimumReleaseAgeExclude:
#     - react
#     - typescript
#
# ============================================================================
minimumReleaseAge: 1440

minimumReleaseAgeExclude:
  # Exclude @replit scoped packages from the minimum release age check.
  # These are published by Replit and trusted — the supply-chain attack vector
  # this setting guards against does not apply to our own packages.
  - '@replit/*'
  - stripe-replit-sync

packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts

catalog:
  '@replit/vite-plugin-cartographer': ^0.5.1
  '@replit/vite-plugin-dev-banner': ^0.1.1
  '@replit/vite-plugin-runtime-error-modal': ^0.0.6
  '@tailwindcss/vite': ^4.1.14
  '@tanstack/react-query': ^5.90.21
  '@types/node': ^25.3.3
  '@types/react': ^19.2.0
  '@types/react-dom': ^19.2.0
  '@vitejs/plugin-react': ^5.0.4
  class-variance-authority: ^0.7.1
  clsx: ^2.1.1
  drizzle-orm: ^0.45.2
  framer-motion: ^12.23.24
  lucide-react: ^0.545.0
  # Must be this exact version because expo requires it
  react: 19.1.0
  # Must be this exact version because expo requires it
  react-dom: 19.1.0
  tailwind-merge: ^3.3.1
  tailwindcss: ^4.1.14
  tsx: ^4.21.0
  vite: ^7.3.2
  wouter: ^3.3.5
  zod: ^3.25.76

autoInstallPeers: false

onlyBuiltDependencies:
  - '@swc/core'
  - esbuild
  - msw
  - unrs-resolver

overrides:
  # Security: bump vulnerable transitive dependencies to patched versions.
  # See task-1 (GHSA advisories) for details.
  "picomatch@2.3.1": "2.3.2"
  "picomatch@4.0.3": "4.0.4"
  "path-to-regexp@8.3.0": "8.4.2"
  "lodash@4.17.23": "4.18.1"
  "yaml@2.8.2": "2.8.3"
  "brace-expansion@2.0.2": "2.1.0"
  "postcss@8.4.49": "8.5.12"
  "postcss@8.5.8": "8.5.12"
  # GHSA-w5hq-g745-h8pq affects uuid <11.1.0; bump all transitive uuids to a patched version.
  "uuid@3.4.0": "11.1.0"
  "uuid@7.0.3": "11.1.0"
  "uuid@8.3.2": "11.1.0"
  # replit uses linux-x64 only, we can exclude all other platforms
  "esbuild>@esbuild/darwin-arm64": "-"
  "esbuild>@esbuild/darwin-x64": "-"
  "esbuild>@esbuild/freebsd-arm64": "-"
  "esbuild>@esbuild/freebsd-x64": "-"
  "esbuild>@esbuild/linux-arm": "-"
  "esbuild>@esbuild/linux-arm64": "-"
  "esbuild>@esbuild/linux-ia32": "-"
  "esbuild>@esbuild/linux-loong64": "-"
  "esbuild>@esbuild/linux-mips64el": "-"
  "esbuild>@esbuild/linux-ppc64": "-"
  "esbuild>@esbuild/linux-riscv64": "-"
  "esbuild>@esbuild/linux-s390x": "-"
  "esbuild>@esbuild/netbsd-arm64": "-"
  "esbuild>@esbuild/netbsd-x64": "-"
  "esbuild>@esbuild/openbsd-arm64": "-"
  "esbuild>@esbuild/openbsd-x64": "-"
  "esbuild>@esbuild/sunos-x64": "-"
  "esbuild>@esbuild/win32-arm64": "-"
  "esbuild>@esbuild/win32-ia32": "-"
  "esbuild>@esbuild/win32-x64": "-"
  "esbuild>@esbuild/aix-ppc64": '-'
  "esbuild>@esbuild/android-arm": '-'
  "esbuild>@esbuild/android-arm64": '-'
  "esbuild>@esbuild/android-x64": '-'
  "esbuild>@esbuild/openharmony-arm64": '-'
  "lightningcss>lightningcss-android-arm64": "-"
  "lightningcss>lightningcss-darwin-arm64": "-"
  "lightningcss>lightningcss-darwin-x64": "-"
  "lightningcss>lightningcss-freebsd-x64": "-"
  "lightningcss>lightningcss-linux-arm-gnueabihf": "-"
  "lightningcss>lightningcss-linux-arm64-gnu": "-"
  "lightningcss>lightningcss-linux-arm64-musl": "-"
  "lightningcss>lightningcss-linux-x64-musl": "-"
  "lightningcss>lightningcss-win32-arm64-msvc": "-"
  "lightningcss>lightningcss-win32-x64-msvc": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-android-arm64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-darwin-arm64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-darwin-x64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-freebsd-x64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-arm-gnueabihf": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-arm64-gnu": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-arm64-musl": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-win32-arm64-msvc": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-win32-x64-msvc": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-x64-musl": "-"
  "rollup>@rollup/rollup-android-arm-eabi": "-"
  "rollup>@rollup/rollup-android-arm64": "-"
  "rollup>@rollup/rollup-darwin-arm64": "-"
  "rollup>@rollup/rollup-darwin-x64": "-"
  "rollup>@rollup/rollup-freebsd-arm64": "-"
  "rollup>@rollup/rollup-freebsd-x64": "-"
  "rollup>@rollup/rollup-linux-arm-gnueabihf": "-"
  "rollup>@rollup/rollup-linux-arm-musleabihf": "-"
  "rollup>@rollup/rollup-linux-arm64-gnu": "-"
  "rollup>@rollup/rollup-linux-arm64-musl": "-"
  "rollup>@rollup/rollup-linux-loong64-gnu": "-"
  "rollup>@rollup/rollup-linux-loong64-musl": "-"
  "rollup>@rollup/rollup-linux-ppc64-gnu": "-"
  "rollup>@rollup/rollup-linux-ppc64-musl": "-"
  "rollup>@rollup/rollup-linux-riscv64-gnu": "-"
  "rollup>@rollup/rollup-linux-riscv64-musl": "-"
  "rollup>@rollup/rollup-linux-s390x-gnu": "-"
  "rollup>@rollup/rollup-linux-x64-musl": "-"
  "rollup>@rollup/rollup-openbsd-x64": "-"
  "rollup>@rollup/rollup-openharmony-arm64": "-"
  "rollup>@rollup/rollup-win32-arm64-msvc": "-"
  "rollup>@rollup/rollup-win32-ia32-msvc": "-"
  "rollup>@rollup/rollup-win32-x64-gnu": "-"
  "rollup>@rollup/rollup-win32-x64-msvc": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-darwin-arm64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-darwin-x64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-freebsd-ia32": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-freebsd-x64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-linux-arm64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-linux-arm": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-linux-ia32": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-sunos-x64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-win32-ia32": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-win32-x64": "-"
  # drizzle-kit uses esbuild internally on an older version that's vulnerable, this overrides it
  "@esbuild-kit/esm-loader": "npm:tsx@^4.21.0"
  esbuild: "0.27.3"
```

## `replit.md`

```markdown
# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## FabricGhar Mobile App

A Bengali (Bangla) fabric shop management app — Expo React Native mobile + Express API + Postgres. Bengali UI throughout (font fallback uses system Bengali support), dark theme (#0f0f13 bg, #f5a623 accent).

- **Sync model**: User enters their Gmail at first launch (stored in AsyncStorage). All data is scoped by `shopEmail` so the same email on any device shows the same shop data.
- **Tabs**: হোম (Dashboard), পণ্য (Products), বিক্রয় (Sales), খরচ (Expenses), রিপোর্ট (Reports), সেটিংস (Settings).
- **Settings tab**: Shows the signed-in Gmail (tap to copy), JSON backup (share-sheet on mobile / clipboard on web), Excel/.xlsx export with three sheets — পণ্য / বিক্রয় / খরচ (uses `xlsx` package; share-sheet on mobile, browser download on web), JSON restore (file picker), and "use a different email" sign-out.
- **Expenses tab**: Manual daily expense tracking with predefined Bangla categories (দোকান ভাড়া, বিদ্যুৎ বিল, পরিবহন, কর্মচারীর বেতন, etc.), per-month filter, today/total summaries, swipe-to-delete. **Expenses are intentionally standalone** — they are NOT subtracted from sales profit anywhere. The dashboard does not show expense or net-profit fields; the Expenses tab is a self-contained log.
- **Products tab**: Includes a search bar that filters the list by product name or category as you type (case-insensitive). Empty-state copy distinguishes "no products yet" vs "nothing matched the search".
- **App Lock**: Opt-in PIN-based lock (4-digit). Settings → নিরাপত্তা lets the user enable lock (sets a PIN), change PIN, toggle biometric (fingerprint/Face ID) as an additional unlock method, and "lock now". PIN is hashed with `expo-crypto` SHA-256 (salted with email), stored in AsyncStorage scoped per-email at `fabricghar.applock.v1.<email>`. Auto re-locks 20s after backgrounding. Biometric is purely optional — PIN is always available as fallback so the user can never get locked out by a missing/cancelled biometric prompt. Files: `context/AppLockContext.tsx`, `components/LockScreen.tsx`, `components/PinKeypad.tsx`, `components/PinSetupSheet.tsx`, `lib/pinHash.ts`.
- **API endpoints** (Express + Drizzle): `GET/POST/PATCH/DELETE /api/shops/{email}/products`, `GET/POST /api/shops/{email}/sales` (POST atomically validates stock and decrements in a transaction), `GET/POST /api/shops/{email}/expenses`, `DELETE /api/shops/{email}/expenses/{id}`, `GET /api/shops/{email}/dashboard` (sales/products only — no expense data), `GET /api/shops/{email}/report`, `GET /api/shops/{email}/backup` (includes expenses for the standalone log), `POST /api/shops/{email}/restore` (restores expenses too).
- **Bundle hygiene**: Unused Expo packages have been pruned (no `expo-blur`, `expo-glass-effect`, `expo-symbols`, `expo-linear-gradient`, `expo-location`, `expo-image-picker`, `expo-system-ui`, `expo-web-browser`). Before adding back any of these, double-check there's a real consumer. React-Query is configured with `staleTime: 60_000` and `refetchOnWindowFocus: false` to minimize redundant refetches between tab switches.
- **DB tables**: `productsTable`, `salesTable`, `expensesTable`, all indexed by `shop_email`.
- **Icon/splash**: Logo at `artifacts/mobile/assets/images/icon.png`; splash background `#0f0f13`.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Notes

- **GitHub**: User dismissed the GitHub integration on 2026-04-30. They can connect later from Replit's Git pane manually if they want version control hosting. Do not auto-prompt again unless the user explicitly asks.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

```

## `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": false,
    "noImplicitReturns": true,
    "noUnusedLocals": false,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": false,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "skipLibCheck": true,
    "target": "es2022",
    "types": [],
    "customConditions": ["workspace"]
  }
}

```

## `tsconfig.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compileOnSave": false,
  "files": [],
  "references": [
    {
      "path": "./lib/db"
    },
    {
      "path": "./lib/api-client-react"
    },
    {
      "path": "./lib/api-zod"
    }
  ]
}

```

---

# ডেটাবেস লেয়ার (lib/db)


## `lib/db/package.json`

```json
{
  "name": "@workspace/db",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "push": "drizzle-kit push --config ./drizzle.config.ts",
    "push-force": "drizzle-kit push --force --config ./drizzle.config.ts"
  },
  "dependencies": {
    "drizzle-orm": "catalog:",
    "drizzle-zod": "^0.8.3",
    "pg": "^8.20.0",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@types/pg": "^8.18.0",
    "drizzle-kit": "^0.31.9"
  }
}

```

## `lib/db/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}

```

## `lib/db/drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

```

## `lib/db/src/index.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";

```

## `lib/db/src/schema/index.ts`

```typescript
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

```

---

# API স্পেসিফিকেশন (lib/api-spec)


## `lib/api-spec/package.json`

```json
{
  "name": "@workspace/api-spec",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "codegen": "orval --config ./orval.config.ts && pnpm -w run typecheck:libs"
  },
  "devDependencies": {
    "orval": "^8.5.2"
  }
}

```

## `lib/api-spec/orval.config.ts`

```typescript
import { defineConfig, InputTransformerFn } from "orval";
import path from "path";

const root = path.resolve(__dirname, "..", "..");
const apiClientReactSrc = path.resolve(root, "lib", "api-client-react", "src");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");

// Our exports make assumptions about the title of the API being "Api" (i.e. generated output is `api.ts`).
const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";

  return config;
};

export default defineConfig({
  "api-client-react": {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiClientReactSrc,
      target: "generated",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiZodSrc,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          coerce: {
            query: ['boolean', 'number', 'string'],
            param: ['boolean', 'number', 'string'],
            body: ['bigint', 'date'],
            response: ['bigint', 'date'],
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});

```

## `lib/api-spec/openapi.yaml`

```yaml
openapi: 3.1.0
info:
  # Do not change the title, if the title changes, the import paths will be broken
  title: Api
  version: 0.1.0
  description: FabricGhar API specification — shared shop data scoped by user email
servers:
  - url: /api
    description: Base API path
tags:
  - name: health
    description: Health operations
  - name: auth
    description: Authentication operations
  - name: products
    description: Product catalog operations
  - name: sales
    description: Sales operations
  - name: reports
    description: Aggregate report operations
  - name: expenses
    description: Daily expense tracking operations
  - name: backup
    description: Backup and restore operations
paths:
  /auth/ensure:
    post:
      operationId: ensureAccount
      tags: [auth]
      summary: Ensure an account exists for the given email (idempotent)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/EnsureAccount"
      responses:
        "200":
          description: Account ensured
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuthResult"

  /healthz:
    get:
      operationId: healthCheck
      tags: [health]
      summary: Health check
      responses:
        "200":
          description: Healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthStatus"

  /shops/{email}/products:
    get:
      operationId: listProducts
      tags: [products]
      summary: List all products for a shop
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      responses:
        "200":
          description: List of products
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Product"
    post:
      operationId: createProduct
      tags: [products]
      summary: Create a new product
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ProductInput"
      responses:
        "201":
          description: Product created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Product"

  /shops/{email}/products/{id}:
    patch:
      operationId: updateProduct
      tags: [products]
      summary: Update an existing product
      parameters:
        - $ref: "#/components/parameters/EmailParam"
        - $ref: "#/components/parameters/IdParam"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ProductInput"
      responses:
        "200":
          description: Updated product
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Product"
    delete:
      operationId: deleteProduct
      tags: [products]
      summary: Delete a product
      parameters:
        - $ref: "#/components/parameters/EmailParam"
        - $ref: "#/components/parameters/IdParam"
      responses:
        "204":
          description: Deleted

  /shops/{email}/sales:
    get:
      operationId: listSales
      tags: [sales]
      summary: List all sales for a shop
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      responses:
        "200":
          description: List of sales
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Sale"
    post:
      operationId: createSale
      tags: [sales]
      summary: Record a new sale (also decrements stock)
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SaleInput"
      responses:
        "201":
          description: Sale recorded
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Sale"

  /shops/{email}/sales/{id}:
    patch:
      operationId: updateSale
      tags: [sales]
      summary: Update an existing sale (adjusts stock accordingly)
      parameters:
        - $ref: "#/components/parameters/EmailParam"
        - $ref: "#/components/parameters/IdParam"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SaleInput"
      responses:
        "200":
          description: Updated sale
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Sale"
    delete:
      operationId: deleteSale
      tags: [sales]
      summary: Delete a sale (restores stock)
      parameters:
        - $ref: "#/components/parameters/EmailParam"
        - $ref: "#/components/parameters/IdParam"
      responses:
        "204":
          description: Deleted

  /shops/{email}/dashboard:
    get:
      operationId: getDashboard
      tags: [reports]
      summary: Dashboard summary stats
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      responses:
        "200":
          description: Dashboard summary
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DashboardSummary"

  /shops/{email}/report:
    get:
      operationId: getReport
      tags: [reports]
      summary: Aggregated report (overall, by month, top products)
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      responses:
        "200":
          description: Report data
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReportData"

  /shops/{email}/expenses:
    get:
      operationId: listExpenses
      tags: [expenses]
      summary: List all expenses for a shop
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      responses:
        "200":
          description: List of expenses
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Expense"
    post:
      operationId: createExpense
      tags: [expenses]
      summary: Record a new expense
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ExpenseInput"
      responses:
        "201":
          description: Expense created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Expense"

  /shops/{email}/expenses/{id}:
    delete:
      operationId: deleteExpense
      tags: [expenses]
      summary: Delete an expense
      parameters:
        - $ref: "#/components/parameters/EmailParam"
        - $ref: "#/components/parameters/IdParam"
      responses:
        "204":
          description: Deleted

  /shops/{email}/backup:
    get:
      operationId: getBackup
      tags: [backup]
      summary: Download a full backup snapshot (products + sales)
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      responses:
        "200":
          description: Full backup
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BackupSnapshot"

  /shops/{email}/restore:
    post:
      operationId: restoreBackup
      tags: [backup]
      summary: Replace shop data with the provided backup snapshot
      parameters:
        - $ref: "#/components/parameters/EmailParam"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/BackupSnapshot"
      responses:
        "200":
          description: Restore complete
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RestoreResult"

components:
  parameters:
    EmailParam:
      name: email
      in: path
      required: true
      description: Shop owner email (used as shared workspace identifier)
      schema:
        type: string
    IdParam:
      name: id
      in: path
      required: true
      schema:
        type: string
  schemas:
    HealthStatus:
      type: object
      required: [status]
      properties:
        status:
          type: string

    EnsureAccount:
      type: object
      required: [email]
      properties:
        email:
          type: string

    AuthResult:
      type: object
      required: [ok]
      properties:
        ok:
          type: boolean
        error:
          type: string

    Product:
      type: object
      required: [id, name, cat, buy, sell, stock]
      properties:
        id:
          type: string
        name:
          type: string
        cat:
          type: string
        buy:
          type: number
        sell:
          type: number
        stock:
          type: number

    ProductInput:
      type: object
      required: [name, cat, buy, sell, stock]
      properties:
        name:
          type: string
          minLength: 1
        cat:
          type: string
        buy:
          type: number
        sell:
          type: number
        stock:
          type: number

    Sale:
      type: object
      required: [id, date, pid, pname, qty, price, buy, disc, total, profit]
      properties:
        id:
          type: string
        date:
          type: string
          description: ISO date string
        pid:
          type: string
        pname:
          type: string
        qty:
          type: number
        price:
          type: number
        buy:
          type: number
        disc:
          type: number
        total:
          type: number
        profit:
          type: number
        note:
          type: string

    SaleInput:
      type: object
      required: [pid, qty, price, disc]
      properties:
        pid:
          type: string
        qty:
          type: number
          minimum: 1
        price:
          type: number
          minimum: 0
        disc:
          type: number
          minimum: 0
        note:
          type: string
        date:
          type: string
          description: ISO date string; defaults to now if omitted

    Expense:
      type: object
      required: [id, date, cat, amount]
      properties:
        id:
          type: string
        date:
          type: string
          description: ISO date string
        cat:
          type: string
        amount:
          type: number
        note:
          type: string

    ExpenseInput:
      type: object
      required: [cat, amount]
      properties:
        cat:
          type: string
          minLength: 1
        amount:
          type: number
          minimum: 0
        note:
          type: string
        date:
          type: string
          description: Optional ISO date string (defaults to now)

    DashboardSummary:
      type: object
      required:
        - todayRevenue
        - todayProfit
        - totalRevenue
        - totalProfit
        - productCount
        - lowStockCount
        - todaySales
      properties:
        todayRevenue:
          type: number
        todayProfit:
          type: number
        totalRevenue:
          type: number
        totalProfit:
          type: number
        productCount:
          type: number
        lowStockCount:
          type: number
        todaySales:
          type: array
          items:
            $ref: "#/components/schemas/Sale"

    ReportData:
      type: object
      required:
        - totalRevenue
        - totalCost
        - totalProfit
        - profitMargin
        - byMonth
        - topProducts
      properties:
        totalRevenue:
          type: number
        totalCost:
          type: number
        totalProfit:
          type: number
        profitMargin:
          type: number
        byMonth:
          type: array
          items:
            $ref: "#/components/schemas/MonthlyReportEntry"
        topProducts:
          type: array
          items:
            $ref: "#/components/schemas/ProductReportEntry"

    MonthlyReportEntry:
      type: object
      required: [month, revenue, profit, count]
      properties:
        month:
          type: string
          description: YYYY-MM
        revenue:
          type: number
        profit:
          type: number
        count:
          type: number

    ProductReportEntry:
      type: object
      required: [name, revenue, profit, qty]
      properties:
        name:
          type: string
        revenue:
          type: number
        profit:
          type: number
        qty:
          type: number

    BackupSnapshot:
      type: object
      required: [products, sales]
      properties:
        exportedAt:
          type: string
        products:
          type: array
          items:
            $ref: "#/components/schemas/Product"
        sales:
          type: array
          items:
            $ref: "#/components/schemas/Sale"
        expenses:
          type: array
          items:
            $ref: "#/components/schemas/Expense"

    RestoreResult:
      type: object
      required: [products, sales]
      properties:
        products:
          type: number
        sales:
          type: number
        expenses:
          type: number

```

---

# API Zod ভ্যালিডেটর (lib/api-zod)


## `lib/api-zod/package.json`

```json
{
  "name": "@workspace/api-zod",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "catalog:"
  }
}

```

## `lib/api-zod/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}

```

## `lib/api-zod/src/index.ts`

```typescript
export * from "./generated/api";
export * from "./generated/types";

```

---

# API ক্লায়েন্ট - React (lib/api-client-react)


## `lib/api-client-react/package.json`

```json
{
  "name": "@workspace/api-client-react",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@tanstack/react-query": "catalog:"
  },
  "peerDependencies": {
    "react": ">=18"
  }
}

```

## `lib/api-client-react/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["dom", "es2022"]
  },
  "include": ["src"]
}

```

## `lib/api-client-react/src/index.ts`

```typescript
export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";

```

## `lib/api-client-react/src/custom-fetch.ts`

```typescript
export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type ErrorType<T = unknown> = ApiError<T>;

export type BodyType<T> = T;

export type AuthTokenGetter = () => Promise<string | null> | string | null;

const NO_BODY_STATUS = new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";

// ---------------------------------------------------------------------------
// Module-level configuration
// ---------------------------------------------------------------------------

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

/**
 * Set a base URL that is prepended to every relative request URL
 * (i.e. paths that start with `/`).
 *
 * Useful for Expo bundles that need to call a remote API server.
 * Pass `null` to clear the base URL.
 */
export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

/**
 * Register a getter that supplies a bearer auth token.  Before every fetch
 * the getter is invoked; when it returns a non-null string, an
 * `Authorization: Bearer <token>` header is attached to the request.
 *
 * Useful for Expo bundles making token-gated API calls.
 * Pass `null` to clear the getter.
 *
 * NOTE: This function should never be used in web applications where session
 * token cookies are automatically associated with API calls by the browser.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

function isRequest(input: RequestInfo | URL): input is Request {
  return typeof Request !== "undefined" && input instanceof Request;
}

function resolveMethod(input: RequestInfo | URL, explicitMethod?: string): string {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}

// Use loose check for URL — some runtimes (e.g. React Native) polyfill URL
// differently, so `instanceof URL` can fail.
function isUrl(input: RequestInfo | URL): input is URL {
  return typeof URL !== "undefined" && input instanceof URL;
}

function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  // Only prepend to relative paths (starting with /)
  if (!url.startsWith("/")) return input;

  const absolute = `${_baseUrl}${url}`;
  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input as Request);
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function getMediaType(headers: Headers): string | null {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}

function isJsonMediaType(mediaType: string | null): boolean {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}

function isTextMediaType(mediaType: string | null): boolean {
  return Boolean(
    mediaType &&
      (mediaType.startsWith("text/") ||
        mediaType === "application/xml" ||
        mediaType === "text/xml" ||
        mediaType.endsWith("+xml") ||
        mediaType === "application/x-www-form-urlencoded"),
  );
}

// Use strict equality: in browsers, `response.body` is `null` when the
// response genuinely has no content.  In React Native, `response.body` is
// always `undefined` because the ReadableStream API is not implemented —
// even when the response carries a full payload readable via `.text()` or
// `.json()`.  Loose equality (`== null`) matches both `null` and `undefined`,
// which causes every React Native response to be treated as empty.
function hasNoBody(response: Response, method: string): boolean {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function getStringField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const candidate = (value as Record<string, unknown>)[key];
  if (typeof candidate !== "string") return undefined;

  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
}

function truncate(text: string, maxLength = 300): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function buildErrorMessage(response: Response, data: unknown): string {
  const prefix = `HTTP ${response.status} ${response.statusText}`;

  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }

  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message =
    getStringField(data, "message") ??
    getStringField(data, "error_description") ??
    getStringField(data, "error");

  if (title && detail) return `${prefix}: ${title} — ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;

  return prefix;
}

export class ApiError<T = unknown> extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;

  constructor(
    response: Response,
    data: T | null,
    requestInfo: { method: string; url: string },
  ) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}

export class ResponseParseError extends Error {
  readonly name = "ResponseParseError";
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;
  readonly rawBody: string;
  readonly cause: unknown;

  constructor(
    response: Response,
    rawBody: string,
    cause: unknown,
    requestInfo: { method: string; url: string },
  ) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} ` +
        `(${response.status} ${response.statusText}) as JSON`,
    );
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}

async function parseJsonBody(
  response: Response,
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  const raw = await response.text();
  const normalized = stripBom(raw);

  if (normalized.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}

async function parseErrorBody(response: Response, method: string): Promise<unknown> {
  if (hasNoBody(response, method)) {
    return null;
  }

  const mediaType = getMediaType(response.headers);

  // Fall back to text when blob() is unavailable (e.g. some React Native builds).
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }

  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();

  if (trimmed === "") {
    return null;
  }

  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }

  return raw;
}

function inferResponseType(response: Response): "json" | "text" | "blob" {
  const mediaType = getMediaType(response.headers);

  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}

async function parseSuccessBody(
  response: Response,
  responseType: "json" | "text" | "blob" | "auto",
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }

  const effectiveType =
    responseType === "auto" ? inferResponseType(response) : responseType;

  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);

    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }

    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          "Blob responses are not supported in this runtime. " +
            "Use responseType \"json\" or \"text\" instead.",
        );
      }
      return response.blob();
  }
}

export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;

  const method = resolveMethod(input, init.method);

  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }

  const headers = mergeHeaders(isRequest(input) ? input.headers : undefined, headersInit);

  if (
    typeof init.body === "string" &&
    !headers.has("content-type") &&
    looksLikeJson(init.body)
  ) {
    headers.set("content-type", "application/json");
  }

  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }

  // Attach bearer token when an auth getter is configured and no
  // Authorization header has been explicitly provided.
  if (_authTokenGetter && !headers.has("authorization")) {
    const token = await _authTokenGetter();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const requestInfo = { method, url: resolveUrl(input) };

  const response = await fetch(input, { ...init, method, headers });

  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }

  return (await parseSuccessBody(response, responseType, requestInfo)) as T;
}

```

---

# API সার্ভার - Express (artifacts/api-server)


## `artifacts/api-server/package.json`

```json
{
  "name": "@workspace/api-server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "export NODE_ENV=development && pnpm run build && pnpm run start",
    "build": "node ./build.mjs",
    "start": "node --enable-source-maps ./dist/index.mjs",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@workspace/api-zod": "workspace:*",
    "@workspace/db": "workspace:*",
    "bcryptjs": "^3.0.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2",
    "drizzle-orm": "catalog:",
    "express": "^5",
    "pino": "^9",
    "pino-http": "^10"
  },
  "devDependencies": {
    "@types/bcryptjs": "^3.0.0",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "catalog:",
    "esbuild": "^0.27.3",
    "esbuild-plugin-pino": "^2.3.3",
    "pino-pretty": "^13",
    "thread-stream": "3.1.0"
  }
}

```

## `artifacts/api-server/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"],
  "references": [
    {
      "path": "../../lib/db"
    },
    {
      "path": "../../lib/api-zod"
    }
  ]
}

```

## `artifacts/api-server/build.mjs`

```javascript
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Some packages may not be bundleable, so we externalize them, we can add more here as needed.
    // Some of the packages below may not be imported or installed, but we're adding them in case they are in the future.
    // Examples of unbundleable packages:
    // - uses native modules and loads them dynamically (e.g. sharp)
    // - use path traversal to read files (e.g. @google-cloud/secret-manager loads sibling .proto files)
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      // pino relies on workers to handle logging, instead of externalizing it we use a plugin to handle it
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

```

## `artifacts/api-server/src/index.ts`

```typescript
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

```

## `artifacts/api-server/src/app.ts`

```typescript
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;

```

## `artifacts/api-server/src/lib/logger.ts`

```typescript
import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});

```

## `artifacts/api-server/src/routes/index.ts`

```typescript
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import salesRouter from "./sales";
import reportsRouter from "./reports";
import expensesRouter from "./expenses";
import backupRouter from "./backup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(salesRouter);
router.use(reportsRouter);
router.use(expensesRouter);
router.use(backupRouter);

export default router;

```

## `artifacts/api-server/src/routes/health.ts`

```typescript
import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;

```

## `artifacts/api-server/src/routes/auth.ts`

```typescript
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

```

## `artifacts/api-server/src/routes/products.ts`

```typescript
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

```

## `artifacts/api-server/src/routes/sales.ts`

```typescript
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

```

## `artifacts/api-server/src/routes/expenses.ts`

```typescript
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

```

## `artifacts/api-server/src/routes/reports.ts`

```typescript
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

```

## `artifacts/api-server/src/routes/backup.ts`

```typescript
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

```

---

# মোবাইল অ্যাপ - কনফিগ


## `artifacts/mobile/package.json`

```json
{
  "name": "@workspace/mobile",
  "version": "0.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN EXPO_PUBLIC_REPL_ID=$REPL_ID REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN pnpm exec expo start --localhost --port $PORT",
    "build": "node scripts/build.js",
    "serve": "node server/serve.js",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@expo-google-fonts/inter": "^0.4.0",
    "@expo/cli": "54.0.23",
    "@expo/ngrok": "^4.1.0",
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@stardazed/streams-text-encoding": "^1.0.2",
    "@tanstack/react-query": "catalog:",
    "@types/react": "~19.1.10",
    "@types/react-dom": "~19.1.7",
    "@ungap/structured-clone": "^1.3.0",
    "@workspace/api-client-react": "workspace:*",
    "babel-plugin-react-compiler": "^19.0.0-beta-e993439-20250117",
    "expo": "~54.0.27",
    "expo-constants": "~18.0.11",
    "expo-font": "~14.0.10",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-linking": "~8.0.10",
    "expo-router": "~6.0.17",
    "expo-splash-screen": "~31.0.12",
    "expo-status-bar": "~3.0.9",
    "react": "catalog:",
    "react-dom": "catalog:",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-keyboard-controller": "1.18.5",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "^0.21.0",
    "react-native-worklets": "0.5.1",
    "typescript": "~5.9.2",
    "zod": "catalog:",
    "zod-validation-error": "^3.4.0"
  },
  "dependencies": {
    "expo-clipboard": "~8.0.8",
    "expo-crypto": "^15.0.9",
    "expo-document-picker": "~14.0.8",
    "expo-file-system": "~19.0.22",
    "expo-local-authentication": "~17.0.8",
    "expo-sharing": "~14.0.8",
    "lucide-react-native": "^1.11.0",
    "xlsx": "^0.18.5"
  }
}

```

## `artifacts/mobile/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "baseUrl": ".",
    "strict": true,
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "references": [
    {
      "path": "../../lib/api-client-react"
    }
  ]
}

```

## `artifacts/mobile/app.json`

```json
{
  "expo": {
    "name": "FabricGhar",
    "slug": "mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "mobile",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f0f13"
    },
    "ios": {
      "supportsTablet": false
    },
    "android": {},
    "web": {
      "favicon": "./assets/images/icon.png"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://replit.com/"
        }
      ],
      "expo-font",
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "FabricGhar আপনার দোকানের তথ্য সুরক্ষিত রাখতে Face ID ব্যবহার করে।"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}

```

## `artifacts/mobile/babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  };
};

```

## `artifacts/mobile/metro.config.js`

```javascript
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);

```

## `artifacts/mobile/expo-env.d.ts`

```typescript
/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore
```

## `artifacts/mobile/scripts/build.js`

```javascript
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

let metroProcess = null;

const projectRoot = path.resolve(__dirname, "..");

function findWorkspaceRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("Could not find workspace root (no pnpm-workspace.yaml found)");
}

const workspaceRoot = findWorkspaceRoot(projectRoot);
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

function exitWithError(message) {
  console.error(message);
  if (metroProcess) {
    metroProcess.kill();
  }
  process.exit(1);
}

function setupSignalHandlers() {
  const cleanup = () => {
    if (metroProcess) {
      console.log("Cleaning up Metro process...");
      metroProcess.kill();
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);
}

function stripProtocol(domain) {
  let urlString = domain.trim();

  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  return new URL(urlString).host;
}

function getDeploymentDomain() {
  if (process.env.REPLIT_INTERNAL_APP_DOMAIN) {
    return stripProtocol(process.env.REPLIT_INTERNAL_APP_DOMAIN);
  }

  if (process.env.REPLIT_DEV_DOMAIN) {
    return stripProtocol(process.env.REPLIT_DEV_DOMAIN);
  }

  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return stripProtocol(process.env.EXPO_PUBLIC_DOMAIN);
  }

  console.error(
    "ERROR: No deployment domain found. Set REPLIT_INTERNAL_APP_DOMAIN, REPLIT_DEV_DOMAIN, or EXPO_PUBLIC_DOMAIN",
  );
  process.exit(1);
}

function prepareDirectories(timestamp) {
  console.log("Preparing build directories...");

  const staticBuild = path.join(projectRoot, "static-build");
  if (fs.existsSync(staticBuild)) {
    fs.rmSync(staticBuild, { recursive: true });
  }

  const dirs = [
    path.join(staticBuild, timestamp, "_expo", "static", "js", "ios"),
    path.join(staticBuild, timestamp, "_expo", "static", "js", "android"),
    path.join(staticBuild, "ios"),
    path.join(staticBuild, "android"),
  ];

  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log("Build:", timestamp);
}

function clearMetroCache() {
  console.log("Clearing Metro cache...");

  const cacheDirs = [
    path.join(projectRoot, ".metro-cache"),
    path.join(projectRoot, "node_modules/.cache/metro"),
  ];

  for (const dir of cacheDirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log("Cache cleared");
}

async function checkMetroHealth() {
  try {
    const response = await fetch("http://localhost:8081/status", {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function getExpoPublicReplId() {
  return process.env.REPL_ID || process.env.EXPO_PUBLIC_REPL_ID;
}

async function startMetro(expoPublicDomain, expoPublicReplId) {
  const isRunning = await checkMetroHealth();
  if (isRunning) {
    console.log("Metro already running");
    return;
  }

  console.log("Starting Metro...");
  console.log(`Setting EXPO_PUBLIC_DOMAIN=${expoPublicDomain}`);
  const env = {
    ...process.env,
    EXPO_PUBLIC_DOMAIN: expoPublicDomain,
    EXPO_PUBLIC_REPL_ID: expoPublicReplId,
  };

  if (expoPublicReplId) {
    console.log(`Setting EXPO_PUBLIC_REPL_ID=${expoPublicReplId}`);
  }

  metroProcess = spawn(
    "pnpm",
    [
      "exec",
      "expo",
      "start",
      "--no-dev",
      "--minify",
      "--localhost",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
      cwd: projectRoot,
      env,
    },
  );

  if (metroProcess.stdout) {
    metroProcess.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output) console.log(`[Metro] ${output}`);
    });
  }
  if (metroProcess.stderr) {
    metroProcess.stderr.on("data", (data) => {
      const output = data.toString().trim();
      if (output) console.error(`[Metro Error] ${output}`);
    });
  }

  for (let i = 0; i < 60; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const healthy = await checkMetroHealth();
    if (healthy) {
      console.log("Metro ready");
      return;
    }
  }

  console.error("Metro timeout");
  process.exit(1);
}

async function downloadFile(url, outputPath) {
  const controller = new AbortController();
  const fiveMinMS = 5 * 60 * 1_000;
  const timeoutId = setTimeout(() => controller.abort(), fiveMinMS);

  try {
    console.log(`Downloading: ${url}`);
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const file = fs.createWriteStream(outputPath);
    await pipeline(Readable.fromWeb(response.body), file);

    const fileSize = fs.statSync(outputPath).size;

    if (fileSize === 0) {
      fs.unlinkSync(outputPath);
      throw new Error("Downloaded file is empty");
    }
  } catch (error) {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    if (error.name === "AbortError") {
      throw new Error(`Download timeout after 5m: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function downloadBundle(platform, timestamp) {
  const entryPath = path.resolve(projectRoot, "node_modules", "expo-router", "entry");
  const bundlePath = path.relative(workspaceRoot, entryPath);
  const url = new URL(`http://localhost:8081/${bundlePath}.bundle`);
  url.searchParams.set("platform", platform);
  url.searchParams.set("dev", "false");
  url.searchParams.set("hot", "false");
  url.searchParams.set("lazy", "false");
  url.searchParams.set("minify", "true");

  const output = path.join(
    "static-build",
    timestamp,
    "_expo",
    "static",
    "js",
    platform,
    "bundle.js",
  );

  console.log(`Fetching ${platform} bundle...`);
  await downloadFile(url.toString(), output);
  console.log(`${platform} bundle ready`);
}

async function downloadManifest(platform) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000);

  try {
    console.log(`Fetching ${platform} manifest...`);
    const response = await fetch("http://localhost:8081/manifest", {
      headers: { "expo-platform": platform },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const manifest = await response.json();
    console.log(`${platform} manifest ready`);
    return manifest;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `Manifest download timeout after 5m for platform: ${platform}`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function downloadBundlesAndManifests(timestamp) {
  console.log("Downloading bundles and manifests...");
  console.log("This may take several minutes for production builds...");

  try {
    // Bundles are sequential — Metro can't handle both platforms simultaneously
    // without stalling. Manifests are cheap and run in parallel after.
    await downloadBundle("ios", timestamp);
    await downloadBundle("android", timestamp);

    const [iosManifest, androidManifest] = await Promise.all([
      downloadManifest("ios"),
      downloadManifest("android"),
    ]);

    console.log("All downloads completed successfully");
    return { ios: iosManifest, android: androidManifest };
  } catch (error) {
    exitWithError(`Download failed: ${error.message}`);
  }
}

function extractAssets(timestamp) {
  const staticBuild = path.join(projectRoot, "static-build");
  const bundles = {
    ios: fs.readFileSync(
      path.join(staticBuild, timestamp, "_expo", "static", "js", "ios", "bundle.js"),
      "utf-8",
    ),
    android: fs.readFileSync(
      path.join(staticBuild, timestamp, "_expo", "static", "js", "android", "bundle.js"),
      "utf-8",
    ),
  };

  const assetsMap = new Map();
  const assetPattern =
    /httpServerLocation:"([^"]+)"[^}]*hash:"([^"]+)"[^}]*name:"([^"]+)"[^}]*type:"([^"]+)"/g;

  const extractFromBundle = (bundle, platform) => {
    for (const match of bundle.matchAll(assetPattern)) {
      const originalPath = match[1];
      const filename = match[3] + "." + match[4];

      const tempUrl = new URL(`http://localhost:8081${originalPath}`);
      const unstablePath = tempUrl.searchParams.get("unstable_path");

      if (!unstablePath) {
        throw new Error(`Asset missing unstable_path: ${originalPath}`);
      }

      const decodedPath = decodeURIComponent(unstablePath);
      const key = path.posix.join(decodedPath, filename);

      if (!assetsMap.has(key)) {
        const asset = {
          url: path.posix.join("/", decodedPath, filename),
          originalPath: originalPath,
          filename: filename,
          relativePath: decodedPath,
          hash: match[2],
          platforms: new Set(),
        };

        assetsMap.set(key, asset);
      }
      assetsMap.get(key).platforms.add(platform);
    }
  };

  extractFromBundle(bundles.ios, "ios");
  extractFromBundle(bundles.android, "android");

  return Array.from(assetsMap.values());
}

async function downloadAssets(assets, timestamp) {
  if (assets.length === 0) {
    return 0;
  }

  console.log("Copying assets...");
  let successCount = 0;
  const failures = [];

  const downloadPromises = assets.map(async (asset) => {
    const tempUrl = new URL(`http://localhost:8081${asset.originalPath}`);
    const unstablePath = tempUrl.searchParams.get("unstable_path");

    if (!unstablePath) {
      throw new Error(`Asset missing unstable_path: ${asset.originalPath}`);
    }

    const decodedPath = decodeURIComponent(unstablePath);

    const outputDir = path.join(
      projectRoot,
      "static-build",
      timestamp,
      "_expo",
      "static",
      "js",
      asset.relativePath,
    );
    fs.mkdirSync(outputDir, { recursive: true });
    const output = path.join(outputDir, asset.filename);

    try {
      const candidates = [
        path.join(projectRoot, decodedPath, asset.filename),
        path.join(workspaceRoot, decodedPath, asset.filename),
      ];
      const found = candidates.find((p) => fs.existsSync(p));
      if (!found) {
        throw new Error(`Asset not found on disk: ${asset.filename}`);
      }
      fs.copyFileSync(found, output);
      successCount++;
    } catch (error) {
      failures.push({
        filename: asset.filename,
        error: error.message,
        url: asset.originalPath,
      });
    }
  });

  await Promise.all(downloadPromises);

  if (failures.length > 0) {
    const errorMsg =
      `Failed to download ${failures.length} asset(s):\n` +
      failures
        .map((f) => `  - ${f.filename}: ${f.error} (${f.url})`)
        .join("\n");
    exitWithError(errorMsg);
  }

  console.log(`Copied ${successCount} assets`);
  return successCount;
}

function updateBundleUrls(timestamp, baseUrl) {
  const updateForPlatform = (platform) => {
    const bundlePath = path.join(
      projectRoot,
      "static-build",
      timestamp,
      "_expo",
      "static",
      "js",
      platform,
      "bundle.js",
    );
    let bundle = fs.readFileSync(bundlePath, "utf-8");

    bundle = bundle.replace(
      /httpServerLocation:"(\/[^"]+)"/g,
      (_match, capturedPath) => {
        const tempUrl = new URL(`http://localhost:8081${capturedPath}`);
        const unstablePath = tempUrl.searchParams.get("unstable_path");

        if (!unstablePath) {
          throw new Error(
            `Asset missing unstable_path in bundle: ${capturedPath}`,
          );
        }

        const decodedPath = decodeURIComponent(unstablePath);
        return `httpServerLocation:"${baseUrl}${basePath}/${timestamp}/_expo/static/js/${decodedPath}"`;
      },
    );

    fs.writeFileSync(bundlePath, bundle);
  };

  updateForPlatform("ios");
  updateForPlatform("android");
  console.log("Updated bundle URLs");
}

function updateManifests(manifests, timestamp, baseUrl, assetsByHash) {
  const updateForPlatform = (platform, manifest) => {
    if (!manifest.launchAsset || !manifest.extra) {
      exitWithError(`Malformed manifest for ${platform}`);
    }

    manifest.launchAsset.url = `${baseUrl}${basePath}/${timestamp}/_expo/static/js/${platform}/bundle.js`;
    manifest.launchAsset.key = `bundle-${timestamp}`;
    manifest.createdAt = new Date(
      Number(timestamp.split("-")[0]),
    ).toISOString();
    manifest.extra.expoClient.hostUri =
      baseUrl.replace("https://", "") + "/" + platform;
    manifest.extra.expoGo.debuggerHost =
      baseUrl.replace("https://", "") + "/" + platform;
    manifest.extra.expoGo.packagerOpts.dev = false;

    if (manifest.assets && manifest.assets.length > 0) {
      manifest.assets.forEach((asset) => {
        if (!asset.url) return;

        const hash = asset.hash;
        if (!hash) return;

        const assetInfo = assetsByHash.get(hash);
        if (!assetInfo) return;

        asset.url = `${baseUrl}${basePath}/${timestamp}/_expo/static/js/${assetInfo.relativePath}/${assetInfo.filename}`;
      });
    }

    fs.writeFileSync(
      path.join(projectRoot, "static-build", platform, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
  };

  updateForPlatform("ios", manifests.ios);
  updateForPlatform("android", manifests.android);
  console.log("Manifests updated");
}

async function main() {
  console.log("Building static Expo Go deployment...");

  setupSignalHandlers();

  const domain = getDeploymentDomain();
  const expoPublicReplId = getExpoPublicReplId();
  const baseUrl = `https://${domain}`;
  const timestamp = `${Date.now()}-${process.pid}`;

  prepareDirectories(timestamp);
  clearMetroCache();

  await startMetro(domain, expoPublicReplId);

  const downloadTimeout = 600000;
  const downloadPromise = downloadBundlesAndManifests(timestamp);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Overall download timeout after ${downloadTimeout / 1000} seconds. ` +
            "Metro may be struggling to generate bundles. Check Metro logs above.",
        ),
      );
    }, downloadTimeout);
  });

  const manifests = await Promise.race([downloadPromise, timeoutPromise]);

  console.log("Processing assets...");
  const assets = extractAssets(timestamp);
  console.log("Found", assets.length, "unique asset(s)");

  const assetsByHash = new Map();
  for (const asset of assets) {
    assetsByHash.set(asset.hash, {
      relativePath: asset.relativePath,
      filename: asset.filename,
    });
  }

  const assetCount = await downloadAssets(assets, timestamp);

  if (assetCount > 0) {
    updateBundleUrls(timestamp, baseUrl);
  }

  console.log("Updating manifests and creating landing page...");
  updateManifests(manifests, timestamp, baseUrl, assetsByHash);

  console.log("Build complete! Deploy to:", baseUrl);

  if (metroProcess) {
    metroProcess.kill();
  }
  process.exit(0);
}

main().catch((error) => {
  console.error("Build failed:", error.message);
  if (metroProcess) {
    metroProcess.kill();
  }
  process.exit(1);
});

```

## `artifacts/mobile/server/serve.js`

```javascript
/**
 * Standalone production server for Expo static builds.
 *
 * Serves the output of build.js (static-build/) with two special routes:
 * - GET / or /manifest with expo-platform header → platform manifest JSON
 * - GET / without expo-platform → landing page HTML
 * Everything else falls through to static file serving from ./static-build/.
 *
 * Zero external dependencies — uses only Node.js built-ins (http, fs, path).
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const STATIC_ROOT = path.resolve(__dirname, "..", "static-build");
const TEMPLATE_PATH = path.resolve(__dirname, "templates", "landing-page.html");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

function getAppName() {
  try {
    const appJsonPath = path.resolve(__dirname, "..", "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(
      JSON.stringify({ error: `Manifest not found for platform: ${platform}` }),
    );
    return;
  }

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(manifest);
}

function serveLandingPage(req, res, landingPageTemplate, appName) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}

function serveStaticFile(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safePath);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "content-type": contentType });
  res.end(content);
}

const landingPageTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const appName = getAppName();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  if (pathname === "/" || pathname === "/manifest") {
    const platform = req.headers["expo-platform"];
    if (platform === "ios" || platform === "android") {
      return serveManifest(platform, res);
    }

    if (pathname === "/") {
      return serveLandingPage(req, res, landingPageTemplate, appName);
    }
  }

  serveStaticFile(pathname, res);
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving static Expo build on port ${port}`);
});

```

---

# মোবাইল অ্যাপ - Constants, Lib, Hooks


## `artifacts/mobile/constants/colors.ts`

```typescript
const palette = {
  bg: "#0f0f13",
  surface: "#1a1a22",
  surface2: "#22222e",
  border: "#2e2e3e",
  accent: "#f5a623",
  accent2: "#e85d75",
  green: "#2ecc71",
  red: "#e74c3c",
  blue: "#3498db",
  text: "#f0f0f5",
  text2: "#9090aa",
};

const shared = {
  text: palette.text,
  tint: palette.accent,

  background: palette.bg,
  foreground: palette.text,

  card: palette.surface,
  cardForeground: palette.text,
  cardElevated: palette.surface2,

  primary: palette.accent,
  primaryForeground: "#000000",

  secondary: palette.surface2,
  secondaryForeground: palette.text,

  muted: palette.surface2,
  mutedForeground: palette.text2,

  accent: palette.accent,
  accentForeground: "#000000",
  accent2: palette.accent2,

  destructive: palette.red,
  destructiveForeground: "#ffffff",

  success: palette.green,
  warning: palette.accent,
  info: palette.blue,

  border: palette.border,
  input: palette.surface2,
};

const colors = {
  light: shared,
  dark: shared,
  radius: 12,
};

export default colors;

```

## `artifacts/mobile/lib/format.ts`

```typescript
export function fmt(n: number | string | null | undefined): string {
  const num = typeof n === "number" ? n : Number(n ?? 0);
  if (!isFinite(num)) return "0";
  try {
    return num.toLocaleString("bn-BD", { maximumFractionDigits: 0 });
  } catch {
    return Math.round(num).toString();
  }
}

export function tk(n: number | string | null | undefined): string {
  return "৳" + fmt(n);
}

export function bnDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date.toDateString();
  }
}

export function bnLongDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return date.toLocaleDateString("bn-BD", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date.toDateString();
  }
}

export function bnMonth(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  if (!y || !m) return monthKey;
  const date = new Date(Number(y), Number(m) - 1, 1);
  try {
    return date.toLocaleDateString("bn-BD", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return monthKey;
  }
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

```

## `artifacts/mobile/lib/pinHash.ts`

```typescript
import * as Crypto from "expo-crypto";

const APP_SALT = "fabricghar.applock.v1";

export async function hashPin(
  pin: string,
  scope: string,
): Promise<string> {
  const payload = `${APP_SALT}|${scope}|${pin}`;
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload,
  );
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

```

## `artifacts/mobile/hooks/useColors.ts`

```typescript
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Falls back to the light palette when no dark key is defined in
 * constants/colors.ts (the scaffold ships light-only by default).
 * When a sibling web artifact's dark tokens are synced into a `dark`
 * key, this hook will automatically switch palettes based on the
 * device's appearance setting.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette =
    scheme === "dark" && "dark" in colors
      ? ((colors as unknown as Record<string, typeof colors.light>).dark ??
        colors.light)
      : colors.light;
  return { ...palette, radius: colors.radius };
}

```

---

# মোবাইল অ্যাপ - Contexts


## `artifacts/mobile/context/ShopContext.tsx`

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "fabricghar.shopEmail";

type ShopState = {
  email: string | null;
  ready: boolean;
  setEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmailState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (cancelled) return;
        if (v) setEmailState(v.toLowerCase());
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setEmail = useCallback(async (next: string) => {
    const norm = next.trim().toLowerCase();
    await AsyncStorage.setItem(STORAGE_KEY, norm);
    setEmailState(norm);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setEmailState(null);
  }, []);

  const value = useMemo<ShopState>(
    () => ({ email, ready, setEmail, signOut }),
    [email, ready, setEmail, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop(): ShopState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}

```

## `artifacts/mobile/context/ToastContext.tsx`

```tsx
import { AlertCircle, CheckCircle2, Info } from "lucide-react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type ToastKind = "success" | "error" | "info";

type ToastState = {
  show: (msg: string, kind?: ToastKind) => void;
};

const Ctx = createContext<ToastState | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<string>("");
  const [kind, setKind] = useState<ToastKind>("info");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [opacity, translateY]);

  const show = useCallback(
    (m: string, k: ToastKind = "info") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMsg(m);
      setKind(k);
      setVisible(true);
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
      timerRef.current = setTimeout(hide, 2500);
    },
    [opacity, translateY, hide],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo<ToastState>(() => ({ show }), [show]);

  const tone =
    kind === "success"
      ? colors.success
      : kind === "error"
        ? colors.destructive
        : colors.info;
  const ToneIcon =
    kind === "success" ? CheckCircle2 : kind === "error" ? AlertCircle : Info;

  return (
    <Ctx.Provider value={value}>
      {children}
      {visible ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            {
              top: insets.top + 12,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <ToneIcon size={18} color={tone} />
            <Text style={[styles.text, { color: colors.text }]}>{msg}</Text>
          </View>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

export function useToast(): ToastState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used inside ToastProvider");
  return v;
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    maxWidth: 480,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});

```

## `artifacts/mobile/context/AppLockContext.tsx`

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuth from "expo-local-authentication";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

import { useShop } from "@/context/ShopContext";
import { hashPin, isValidPin } from "@/lib/pinHash";

type LockState = "checking" | "locked" | "unlocked";

type Settings = {
  enabled: boolean;
  pinHash: string | null;
  biometricEnabled: boolean;
};

type Ctx = {
  state: LockState;
  settings: Settings;
  biometricAvailable: boolean;
  biometricLabel: string;
  /** Try to unlock with a PIN. Returns true on success. */
  unlockWithPin: (pin: string) => Promise<boolean>;
  /** Try to unlock with biometrics. Returns true on success. */
  unlockWithBiometric: () => Promise<boolean>;
  /** Set up or change the PIN. Pass currentPin if a PIN is already set. */
  setPin: (newPin: string, currentPin?: string) => Promise<void>;
  /** Disable the lock entirely. Requires the current PIN. */
  disableLock: (currentPin: string) => Promise<void>;
  /** Toggle whether biometrics can be used to unlock (PIN is always required as fallback). */
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  /** Manually re-lock the app (e.g. used by a "lock now" button). */
  lockNow: () => void;
};

const AppLockCtx = createContext<Ctx | null>(null);

const RELOCK_AFTER_MS = 20_000;
const SETTINGS_KEY_PREFIX = "fabricghar.applock.v1.";

const DEFAULT_SETTINGS: Settings = {
  enabled: false,
  pinHash: null,
  biometricEnabled: false,
};

function settingsKey(email: string): string {
  return `${SETTINGS_KEY_PREFIX}${email.toLowerCase()}`;
}

async function loadSettings(email: string): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(settingsKey(email));
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      enabled: !!parsed.enabled,
      pinHash:
        typeof parsed.pinHash === "string" && parsed.pinHash.length > 0
          ? parsed.pinHash
          : null,
      biometricEnabled: !!parsed.biometricEnabled,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function saveSettings(email: string, s: Settings): Promise<void> {
  await AsyncStorage.setItem(settingsKey(email), JSON.stringify(s));
}

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { ready: shopReady, email } = useShop();
  const [state, setState] = useState<LockState>("checking");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("বায়োমেট্রিক");
  const lastBackgroundedAt = useRef<number | null>(null);
  const inFlightBio = useRef(false);

  // Detect biometric capability once.
  useEffect(() => {
    let cancelled = false;
    if (Platform.OS === "web") {
      setBiometricAvailable(false);
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const has = await LocalAuth.hasHardwareAsync();
        const enrolled = await LocalAuth.isEnrolledAsync();
        const types = await LocalAuth.supportedAuthenticationTypesAsync();
        if (cancelled) return;
        setBiometricAvailable(has && enrolled);
        if (
          types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION)
        ) {
          setBiometricLabel("Face ID");
        } else if (
          types.includes(LocalAuth.AuthenticationType.FINGERPRINT)
        ) {
          setBiometricLabel("ফিঙ্গারপ্রিন্ট");
        } else {
          setBiometricLabel("বায়োমেট্রিক");
        }
      } catch {
        if (!cancelled) setBiometricAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load per-email settings and decide initial state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!shopReady) return;
      if (!email) {
        // No email yet → EmailGate handles UI; don't lock.
        setSettings(DEFAULT_SETTINGS);
        setState("unlocked");
        return;
      }
      const loaded = await loadSettings(email);
      if (cancelled) return;
      setSettings(loaded);
      // Lock only if user has explicitly enabled lock AND has a PIN set.
      if (loaded.enabled && loaded.pinHash) {
        setState("locked");
      } else {
        setState("unlocked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shopReady, email]);

  const persist = useCallback(
    async (next: Settings) => {
      setSettings(next);
      if (email) await saveSettings(email, next);
    },
    [email],
  );

  const unlockWithPin = useCallback(
    async (pin: string) => {
      if (!email || !settings.pinHash) return false;
      if (!isValidPin(pin)) return false;
      const candidate = await hashPin(pin, email);
      if (candidate === settings.pinHash) {
        setState("unlocked");
        return true;
      }
      return false;
    },
    [email, settings.pinHash],
  );

  const unlockWithBiometric = useCallback(async () => {
    if (Platform.OS === "web") return false;
    if (!biometricAvailable || !settings.biometricEnabled) return false;
    if (inFlightBio.current) return false;
    inFlightBio.current = true;
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage: "FabricGhar আনলক করুন",
        cancelLabel: "পিন ব্যবহার করুন",
        disableDeviceFallback: true,
      });
      if (result.success) {
        setState("unlocked");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      inFlightBio.current = false;
    }
  }, [biometricAvailable, settings.biometricEnabled]);

  const setPin = useCallback(
    async (newPin: string, currentPin?: string) => {
      if (!email) throw new Error("কোনো অ্যাকাউন্ট সাইন-ইন নেই।");
      if (!isValidPin(newPin)) {
        throw new Error("পিন অবশ্যই ৪-৬ অঙ্কের সংখ্যা হতে হবে।");
      }
      // If a PIN already exists, require it to change.
      if (settings.pinHash) {
        if (!currentPin) {
          throw new Error("পুরোনো পিন দিন।");
        }
        const ok = (await hashPin(currentPin, email)) === settings.pinHash;
        if (!ok) throw new Error("পুরোনো পিন সঠিক নয়।");
      }
      const newHash = await hashPin(newPin, email);
      await persist({
        ...settings,
        enabled: true,
        pinHash: newHash,
      });
    },
    [email, persist, settings],
  );

  const disableLock = useCallback(
    async (currentPin: string) => {
      if (!email) return;
      if (!settings.pinHash) {
        await persist({ ...DEFAULT_SETTINGS });
        return;
      }
      const ok = (await hashPin(currentPin, email)) === settings.pinHash;
      if (!ok) throw new Error("পিন সঠিক নয়।");
      await persist({ ...DEFAULT_SETTINGS });
      setState("unlocked");
    },
    [email, persist, settings.pinHash],
  );

  const setBiometricEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !biometricAvailable) return;
      await persist({ ...settings, biometricEnabled: enabled });
    },
    [biometricAvailable, persist, settings],
  );

  const lockNow = useCallback(() => {
    if (settings.enabled && settings.pinHash) {
      setState("locked");
    }
  }, [settings.enabled, settings.pinHash]);

  // Re-lock after returning from background past idle threshold.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "background" || next === "inactive") {
        lastBackgroundedAt.current = Date.now();
      } else if (next === "active") {
        const t = lastBackgroundedAt.current;
        lastBackgroundedAt.current = null;
        if (
          t &&
          Date.now() - t > RELOCK_AFTER_MS &&
          settings.enabled &&
          settings.pinHash
        ) {
          setState("locked");
        }
      }
    });
    return () => sub.remove();
  }, [settings.enabled, settings.pinHash]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      settings,
      biometricAvailable,
      biometricLabel,
      unlockWithPin,
      unlockWithBiometric,
      setPin,
      disableLock,
      setBiometricEnabled,
      lockNow,
    }),
    [
      state,
      settings,
      biometricAvailable,
      biometricLabel,
      unlockWithPin,
      unlockWithBiometric,
      setPin,
      disableLock,
      setBiometricEnabled,
      lockNow,
    ],
  );

  return <AppLockCtx.Provider value={value}>{children}</AppLockCtx.Provider>;
}

export function useAppLock() {
  const v = useContext(AppLockCtx);
  if (!v) throw new Error("useAppLock must be used within AppLockProvider");
  return v;
}

```

---

# মোবাইল অ্যাপ - কম্পোনেন্ট


## `artifacts/mobile/components/UI.tsx`

```tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type SectionTitleProps = {
  children: React.ReactNode;
  right?: React.ReactNode;
};

export function SectionTitle({ children, right }: SectionTitleProps) {
  const colors = useColors();
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, { color: colors.mutedForeground }]}>
        {children}
      </Text>
      {right}
    </View>
  );
}

type EmptyProps = {
  text: string;
  hint?: string;
};

export function Empty({ text, hint }: EmptyProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.empty,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
        {text}
      </Text>
      {hint ? (
        <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

type CardProps = { children: React.ReactNode };
export function Card({ children }: CardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      {children}
    </View>
  );
}

type BadgeProps = {
  children: React.ReactNode;
  tone: "green" | "red" | "amber" | "blue";
};
export function Badge({ children, tone }: BadgeProps) {
  const colors = useColors();
  const map = {
    green: { bg: "rgba(46,204,113,0.18)", color: colors.success },
    red: { bg: "rgba(231,76,60,0.18)", color: colors.destructive },
    amber: { bg: "rgba(245,166,35,0.18)", color: colors.accent },
    blue: { bg: "rgba(52,152,219,0.18)", color: colors.info },
  } as const;
  const { bg, color } = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyHint: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

```

## `artifacts/mobile/components/Header.tsx`

```tsx
import { Image } from "expo-image";
import { Plus } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SyncStatus } from "@/components/SyncStatus";
import { useColors } from "@/hooks/useColors";
import { bnLongDate } from "@/lib/format";

type Props = {
  onNewSale: () => void;
};

export function Header({ onNewSale }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.brand}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.accent }]}>
            FabricGhar
          </Text>
        </View>
        <Pressable
          onPress={onNewSale}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius - 2,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Plus size={16} color="#000" strokeWidth={3} />
          <Text style={styles.ctaText}>বিক্রয়</Text>
        </Pressable>
      </View>
      <View style={styles.metaRow}>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {bnLongDate(new Date())}
        </Text>
        <SyncStatus />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: { width: 28, height: 28 },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 12,
  },
});

```

## `artifacts/mobile/components/Sheet.tsx`

```tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Sheet({ visible, onClose, title, children }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get("window").height;
  const translate = useRef(new Animated.Value(screenH)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlay, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: screenH,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlay, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translate, overlay, screenH]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.overlay, { opacity: overlay }]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetWrap,
            {
              transform: [{ translateY: translate }],
            },
          ]}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: insets.bottom + 24,
              },
            ]}
          >
            <View style={styles.handleWrap}>
              <View
                style={[styles.handle, { backgroundColor: colors.border }]}
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <KeyboardAwareScrollViewCompat
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bottomOffset={20}
            >
              {children}
            </KeyboardAwareScrollViewCompat>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "92%",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
});

```

## `artifacts/mobile/components/FormControls.tsx`

```tsx
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, ChevronDown } from "lucide-react-native";

import { useColors } from "@/hooks/useColors";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  flex?: number;
};

export function Field({ label, children, flex }: FieldProps) {
  const colors = useColors();
  return (
    <View style={[styles.field, flex ? { flex } : null]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

type RowProps = { children: React.ReactNode };
export function FieldRow({ children }: RowProps) {
  return <View style={styles.row}>{children}</View>;
}

type InputProps = React.ComponentProps<typeof TextInput> & {
  highlight?: boolean;
};
export function FormInput({ highlight, style, ...rest }: InputProps) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      {...rest}
      style={[
        styles.input,
        {
          backgroundColor: colors.cardElevated,
          borderColor: colors.border,
          color: highlight ? colors.accent : colors.text,
          borderRadius: colors.radius - 2,
          fontWeight: highlight ? "700" : "400",
        },
        style,
      ]}
    />
  );
}

type DateInputProps = {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  max?: string;
  min?: string;
};
export function FormDateInput({ value, onChange, max, min }: DateInputProps) {
  const colors = useColors();
  if (Platform.OS === "web") {
    return (
      <input
        type="date"
        value={value}
        max={max}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: colors.cardElevated,
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: "solid",
          color: colors.text,
          borderRadius: colors.radius - 2,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 12,
          paddingRight: 12,
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          colorScheme: "dark",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );
  }
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={colors.mutedForeground}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
      style={[
        styles.input,
        {
          backgroundColor: colors.cardElevated,
          borderColor: colors.border,
          color: colors.text,
          borderRadius: colors.radius - 2,
        },
      ]}
    />
  );
}

type SelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
};
export function FormSelect({
  value,
  onChange,
  options,
  placeholder,
}: SelectProps) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.select,
          {
            backgroundColor: colors.cardElevated,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            color: selected ? colors.text : colors.mutedForeground,
            fontSize: 15,
            flex: 1,
          }}
        >
          {selected?.label ?? placeholder ?? "নির্বাচন করুন"}
        </Text>
        <ChevronDown size={18} color={colors.mutedForeground} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalBg}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            {options.map((opt, idx) => {
              const active = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: idx === options.length - 1 ? 0 : 1,
                      backgroundColor: active
                        ? colors.cardElevated
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.accent : colors.text,
                      fontSize: 15,
                      fontWeight: active ? "600" : "400",
                      flex: 1,
                    }}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Check size={18} color={colors.accent} strokeWidth={3} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

type SheetButtonsProps = {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel?: string;
  busy?: boolean;
};
export function SheetButtons({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = "বাতিল",
  busy,
}: SheetButtonsProps) {
  const colors = useColors();
  return (
    <View style={styles.buttons}>
      <Pressable
        onPress={onCancel}
        disabled={busy}
        style={({ pressed }) => [
          styles.btnCancel,
          {
            backgroundColor: colors.cardElevated,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={{ color: colors.text, fontSize: 15 }}>{cancelLabel}</Text>
      </Pressable>
      <Pressable
        onPress={onSubmit}
        disabled={busy}
        style={({ pressed }) => [
          styles.btnSubmit,
          {
            backgroundColor: colors.primary,
            borderRadius: colors.radius - 2,
            opacity: pressed || busy ? 0.85 : 1,
          },
        ]}
      >
        <Text style={styles.btnSubmitText}>
          {busy ? "অপেক্ষা করুন..." : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    paddingHorizontal: 13,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    borderWidth: 1,
    fontSize: 15,
  },
  select: {
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    borderWidth: 1,
    overflow: "hidden",
    maxHeight: "70%",
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  btnSubmit: {
    flex: 2,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnSubmitText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
});

```

## `artifacts/mobile/components/KeyboardAwareScrollViewCompat.tsx`

```tsx
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";
import { Platform, ScrollView, ScrollViewProps } from "react-native";

type Props = KeyboardAwareScrollViewProps & ScrollViewProps;

export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = "handled",
  ...props
}: Props) {
  if (Platform.OS === "web") {
    return (
      <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
        {children}
      </ScrollView>
    );
  }
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

```

## `artifacts/mobile/components/EmailGate.tsx`

```tsx
import { ensureAccount } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { ArrowRight, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { isValidEmail } from "@/lib/format";

export function EmailGate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setEmail } = useShop();
  const { show } = useToast();

  const [emailValue, setEmailValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const norm = emailValue.trim().toLowerCase();
    if (!isValidEmail(norm)) {
      show("সঠিক ইমেইল দিন", "error");
      return;
    }
    setBusy(true);
    try {
      await ensureAccount({ email: norm });
      if (Platform.OS !== "web") {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
      await setEmail(norm);
      show("স্বাগতম!", "success");
    } catch {
      show("সংযোগ ব্যর্থ — আবার চেষ্টা করুন", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.accent }]}>
            FabricGhar
          </Text>
          <Text style={[styles.tag, { color: colors.mutedForeground }]}>
            কাপড়ের দোকানের সম্পূর্ণ হিসাব
          </Text>
        </View>

        <View style={styles.formArea}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            আপনার Gmail ঠিকানা
          </Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Mail size={18} color={colors.mutedForeground} />
            <TextInput
              value={emailValue}
              onChangeText={setEmailValue}
              placeholder="example@gmail.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={[styles.input, { color: colors.text }]}
              onSubmitEditing={submit}
              returnKeyType="go"
            />
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            একই ইমেইলে যেকোনো ফোনে লগইন করলে একই ডেটা দেখতে পাবেন। আপনার
            অ্যাপ ফোনের ফিঙ্গারপ্রিন্ট/Face ID/পিন দিয়ে সুরক্ষিত থাকবে।
          </Text>

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius,
                opacity: pressed || busy ? 0.85 : 1,
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.ctaText}>প্রবেশ করুন</Text>
                <ArrowRight size={18} color="#000" strokeWidth={2.5} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  logoWrap: {
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  logo: { width: 96, height: 96 },
  title: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tag: {
    fontSize: 14,
    textAlign: "center",
  },
  formArea: {
    gap: 12,
    paddingBottom: 24,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 4,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "android" ? 10 : 0,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 4,
    marginTop: 4,
  },
  cta: {
    marginTop: 8,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});

```

## `artifacts/mobile/components/ErrorBoundary.tsx`

```tsx
import React, { Component, ComponentType, PropsWithChildren } from "react";

import { ErrorFallback, ErrorFallbackProps } from "@/components/ErrorFallback";

export type ErrorBoundaryProps = PropsWithChildren<{
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, stackTrace: string) => void;
}>;

type ErrorBoundaryState = { error: Error | null };

/**
 * This is a special case for for using the class components. Error boundaries must be class components because React only provides error boundary functionality through lifecycle methods (componentDidCatch and getDerivedStateFromError) which are not available in functional components.
 * https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static defaultProps: {
    FallbackComponent: ComponentType<ErrorFallbackProps>;
  } = {
    FallbackComponent: ErrorFallback,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    if (typeof this.props.onError === "function") {
      this.props.onError(error, info.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render() {
    const { FallbackComponent } = this.props;

    return this.state.error && FallbackComponent ? (
      <FallbackComponent
        error={this.state.error}
        resetError={this.resetError}
      />
    ) : (
      this.props.children
    );
  }
}

```

## `artifacts/mobile/components/ErrorFallback.tsx`

```tsx
import { reloadAppAsync } from "expo";
import { AlertCircle, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  const formatErrorDetails = (): string => {
    let details = `Error: ${error.message}\n\n`;
    if (error.stack) {
      details += `Stack Trace:\n${error.stack}`;
    }
    return details;
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {__DEV__ ? (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityLabel="View error details"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.topButton,
            {
              top: insets.top + 16,
              backgroundColor: colors.card,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <AlertCircle size={20} color={colors.foreground} />
        </Pressable>
      ) : null}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Something went wrong
        </Text>

        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          Please reload the app to continue.
        </Text>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: colors.primaryForeground },
            ]}
          >
            Try Again
          </Text>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  Error Details
                </Text>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  accessibilityLabel="Close error details"
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.closeButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <X size={24} color={colors.foreground} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={[
                  styles.modalScrollContent,
                  { paddingBottom: insets.bottom + 16 },
                ]}
                showsVerticalScrollIndicator
              >
                <View
                  style={[
                    styles.errorContainer,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Text
                    style={[
                      styles.errorText,
                      {
                        color: colors.foreground,
                        fontFamily: monoFont,
                      },
                    ]}
                    selectable
                  >
                    {formatErrorDetails()}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    maxWidth: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 40,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  topButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    paddingHorizontal: 24,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
  },
  errorContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
    width: "100%",
  },
});

```

## `artifacts/mobile/components/SyncStatus.tsx`

```tsx
import { onlineManager, useIsFetching, useIsMutating } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function SyncStatus() {
  const colors = useColors();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [online, setOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((isOnline) => {
      setOnline(isOnline);
    });
  }, []);

  let dotColor = colors.success;
  let label = "সিঙ্ক";
  if (!online) {
    dotColor = colors.destructive;
    label = "অফলাইন";
  } else if (isFetching > 0 || isMutating > 0) {
    dotColor = colors.accent;
    label = "সিঙ্ক হচ্ছে";
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});

```

## `artifacts/mobile/components/ProductSheet.tsx`

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text } from "react-native";
import {
  getListProductsQueryKey,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  type Product,
} from "@workspace/api-client-react";

import {
  Field,
  FieldRow,
  FormInput,
  FormSelect,
  SheetButtons,
} from "@/components/FormControls";
import { Sheet } from "@/components/Sheet";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  "3 পিস",
  "শাড়ি",
  "সালোয়ার কামিজ",
  "কুর্তি",
  "পাঞ্জাবি",
  "শার্ট",
  "প্যান্ট",
  "শিশু পোশাক",
  "অন্যান্য",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  editing: Product | null;
};

export function ProductSheet({ visible, onClose, editing }: Props) {
  const { email } = useShop();
  const { show } = useToast();
  const colors = useColors();
  const qc = useQueryClient();

  const invalidateAll = async () => {
    if (email) {
      await qc.invalidateQueries({
        queryKey: getListProductsQueryKey(email),
      });
    }
    await qc.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey?.[0];
        return (
          typeof key === "string" &&
          (key.includes("dashboard") || key.includes("report"))
        );
      },
    });
  };

  const [name, setName] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0] ?? "অন্যান্য");
  const [buy, setBuy] = useState("");
  const [sell, setSell] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (visible) {
      if (editing) {
        setName(editing.name);
        setCat(editing.cat);
        setBuy(String(editing.buy ?? ""));
        setSell(String(editing.sell ?? ""));
        setStock(String(editing.stock ?? ""));
      } else {
        setName("");
        setCat(CATEGORIES[0] ?? "অন্যান্য");
        setBuy("");
        setSell("");
        setStock("");
      }
    }
  }, [visible, editing]);

  const createMut = useCreateProduct({
    mutation: {
      onSuccess: async () => {
        if (email) {
          await qc.invalidateQueries({
            queryKey: getListProductsQueryKey(email),
          });
        }
        await qc.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return (
              typeof key === "string" &&
              (key.includes("dashboard") || key.includes("report"))
            );
          },
        });
        show("পণ্য যোগ হয়েছে", "success");
        onClose();
      },
      onError: () => show("সংরক্ষণ ব্যর্থ হয়েছে", "error"),
    },
  });

  const updateMut = useUpdateProduct({
    mutation: {
      onSuccess: async () => {
        await invalidateAll();
        show("পরিবর্তন সংরক্ষিত হয়েছে", "success");
        onClose();
      },
      onError: () => show("সংরক্ষণ ব্যর্থ হয়েছে", "error"),
    },
  });

  const deleteMut = useDeleteProduct({
    mutation: {
      onSuccess: async () => {
        await invalidateAll();
        show("পণ্য মুছে ফেলা হয়েছে", "success");
        onClose();
      },
      onError: () => show("মুছে ফেলা যায়নি", "error"),
    },
  });

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  const confirmDelete = () => {
    if (!email || !editing) return;
    const id = editing.id;
    const productName = editing.name;
    if (Platform.OS === "web") {
      const yes = window.confirm(`"${productName}" পণ্যটি মুছে ফেলবেন?`);
      if (yes) deleteMut.mutate({ email, id });
      return;
    }
    Alert.alert(
      "পণ্য মুছে ফেলবেন?",
      `"${productName}" পণ্যটি স্থায়ীভাবে মুছে যাবে। এই কাজ ফিরিয়ে আনা যাবে না।`,
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "মুছে ফেলুন",
          style: "destructive",
          onPress: () => deleteMut.mutate({ email, id }),
        },
      ],
    );
  };

  const submit = () => {
    if (!email) return;
    if (!name.trim()) {
      show("পণ্যের নাম দিন", "error");
      return;
    }
    const data = {
      name: name.trim(),
      cat,
      buy: Number(buy) || 0,
      sell: Number(sell) || 0,
      stock: Number(stock) || 0,
    };
    if (editing) {
      updateMut.mutate({ email, id: editing.id, data });
    } else {
      createMut.mutate({ email, data });
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
    >
      <Field label="পণ্যের নাম">
        <FormInput
          value={name}
          onChangeText={setName}
          placeholder="যেমন: শাড়ি, কুর্তি, পাঞ্জাবি..."
          autoFocus={!editing}
        />
      </Field>
      <Field label="ক্যাটাগরি">
        <FormSelect
          value={cat}
          onChange={setCat}
          options={CATEGORIES.map((c) => ({ label: c, value: c }))}
        />
      </Field>
      <FieldRow>
        <Field label="ক্রয় মূল্য (৳)" flex={1}>
          <FormInput
            value={buy}
            onChangeText={setBuy}
            keyboardType="numeric"
            placeholder="0"
          />
        </Field>
        <Field label="বিক্রয় মূল্য (৳)" flex={1}>
          <FormInput
            value={sell}
            onChangeText={setSell}
            keyboardType="numeric"
            placeholder="0"
          />
        </Field>
      </FieldRow>
      <Field label="স্টক পরিমাণ">
        <FormInput
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          placeholder="0"
        />
      </Field>
      <SheetButtons
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="সংরক্ষণ করুন"
        busy={busy}
      />
      {editing ? (
        <Pressable
          onPress={confirmDelete}
          disabled={busy}
          style={({ pressed }) => [
            styles.deleteBtn,
            {
              borderColor: colors.destructive,
              borderRadius: colors.radius - 2,
              opacity: pressed || busy ? 0.6 : 1,
            },
          ]}
        >
          <Trash2 size={16} color={colors.destructive} strokeWidth={2.4} />
          <Text style={[styles.deleteText, { color: colors.destructive }]}>
            পণ্য মুছে ফেলুন
          </Text>
        </Pressable>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  deleteBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteText: {
    fontWeight: "700",
    fontSize: 14,
  },
});

```

## `artifacts/mobile/components/SaleSheet.tsx`

```tsx
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  getListProductsQueryKey,
  getListSalesQueryKey,
  listProducts,
  useCreateSale,
  useUpdateSale,
  type Product,
  type Sale,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";

import {
  Field,
  FieldRow,
  FormDateInput,
  FormInput,
  FormSelect,
  SheetButtons,
} from "@/components/FormControls";
import { Sheet } from "@/components/Sheet";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { fmt } from "@/lib/format";

type Props = {
  visible: boolean;
  onClose: () => void;
  editing?: Sale | null;
};

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ymdToIso(ymd: string, fallback: Date): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return fallback.toISOString();
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    !year ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return fallback.toISOString();
  }
  const now = new Date();
  const d = new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  );
  return Number.isNaN(d.getTime()) ? fallback.toISOString() : d.toISOString();
}

export function SaleSheet({ visible, onClose, editing }: Props) {
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();
  const isEdit = !!editing;

  const productsQuery = useQuery<Product[]>({
    queryKey: email ? getListProductsQueryKey(email) : ["disabled"],
    queryFn: () => listProducts(email ?? ""),
    enabled: !!email && visible,
  });
  const products: Product[] = productsQuery.data ?? [];

  const [pid, setPid] = useState<string>("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [disc, setDisc] = useState("0");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<string>(toYmd(new Date()));

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setPid(editing.pid);
      setQty(String(editing.qty));
      setPrice(String(editing.price));
      setDisc(String(editing.disc ?? 0));
      setNote(editing.note ?? "");
      setDate(toYmd(new Date(editing.date)));
      return;
    }
    setQty("1");
    setDisc("0");
    setNote("");
    setDate(toYmd(new Date()));
    const first = products[0];
    if (first) {
      setPid(first.id);
      setPrice(String(first.sell ?? ""));
    } else {
      setPid("");
      setPrice("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, products.length, editing?.id]);

  const onSelectProduct = (id: string) => {
    setPid(id);
    if (isEdit) return;
    const p = products.find((x) => x.id === id);
    if (p) setPrice(String(p.sell ?? ""));
  };

  const total = useMemo(() => {
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const d = Number(disc) || 0;
    return Math.max(0, q * p - d);
  }, [qty, price, disc]);

  const invalidate = async () => {
    if (email) {
      await qc.invalidateQueries({
        queryKey: getListSalesQueryKey(email),
      });
      await qc.invalidateQueries({
        queryKey: getListProductsQueryKey(email),
      });
    }
    await qc.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey?.[0];
        return (
          typeof key === "string" &&
          (key.includes("dashboard") || key.includes("report"))
        );
      },
    });
  };

  const createMut = useCreateSale({
    mutation: {
      onSuccess: async () => {
        await invalidate();
        show("বিক্রয় সম্পন্ন হয়েছে", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        show(e?.response?.data?.error ?? "বিক্রয় ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const updateMut = useUpdateSale({
    mutation: {
      onSuccess: async () => {
        await invalidate();
        show("বিক্রয় হালনাগাদ হয়েছে", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        show(e?.response?.data?.error ?? "হালনাগাদ ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const submit = () => {
    if (!email) return;
    if (!pid) {
      show("পণ্য নির্বাচন করুন", "error");
      return;
    }
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const d = Number(disc) || 0;
    if (q <= 0) {
      show("সঠিক পরিমাণ দিন", "error");
      return;
    }
    const product = products.find((x) => x.id === pid);
    if (!isEdit && product && product.stock < q) {
      show(`স্টকে মাত্র ${fmt(product.stock)} পিস আছে`, "error");
      return;
    }
    const fallbackDate = editing ? new Date(editing.date) : new Date();
    const data = {
      pid,
      qty: q,
      price: p,
      disc: d,
      note: note.trim() || undefined,
      date: ymdToIso(date, fallbackDate),
    };
    if (isEdit && editing) {
      updateMut.mutate({ email, id: editing.id, data });
    } else {
      createMut.mutate({ email, data });
    }
  };

  if (products.length === 0 && visible) {
    return (
      <Sheet
        visible={visible}
        onClose={onClose}
        title={isEdit ? "বিক্রয় সম্পাদনা" : "নতুন বিক্রয়"}
      >
        <Field label="">
          <></>
        </Field>
        <SheetButtons
          onCancel={onClose}
          onSubmit={onClose}
          submitLabel="ঠিক আছে"
          cancelLabel="বন্ধ করুন"
        />
      </Sheet>
    );
  }

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={isEdit ? "বিক্রয় সম্পাদনা" : "নতুন বিক্রয়"}
    >
      <Field label="পণ্য">
        <FormSelect
          value={pid}
          onChange={onSelectProduct}
          options={products.map((p) => ({
            value: p.id,
            label: `${p.name} (স্টক: ${fmt(p.stock)})`,
          }))}
        />
      </Field>
      <Field label="তারিখ">
        <FormDateInput
          value={date}
          onChange={setDate}
          max={toYmd(new Date())}
        />
      </Field>
      <FieldRow>
        <Field label="পরিমাণ" flex={1}>
          <FormInput
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
          />
        </Field>
        <Field label="একক মূল্য (৳)" flex={1}>
          <FormInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="ছাড় (৳)" flex={1}>
          <FormInput
            value={disc}
            onChangeText={setDisc}
            keyboardType="numeric"
          />
        </Field>
        <Field label="মোট (৳)" flex={1}>
          <FormInput
            value={fmt(total)}
            editable={false}
            highlight
          />
        </Field>
      </FieldRow>
      <Field label="নোট">
        <FormInput
          value={note}
          onChangeText={setNote}
          placeholder="ক্রেতার নাম বা তথ্য..."
        />
      </Field>
      <SheetButtons
        onCancel={onClose}
        onSubmit={submit}
        submitLabel={isEdit ? "সংরক্ষণ ✓" : "বিক্রয় সম্পন্ন ✓"}
        busy={busy}
      />
    </Sheet>
  );
}

```

## `artifacts/mobile/components/ExpenseSheet.tsx`

```tsx
import { useQueryClient } from "@tanstack/react-query";
import {
  getListExpensesQueryKey,
  useCreateExpense,
} from "@workspace/api-client-react";
import React, { useEffect, useState } from "react";

import {
  Field,
  FieldRow,
  FormInput,
  FormSelect,
  SheetButtons,
} from "@/components/FormControls";
import { Sheet } from "@/components/Sheet";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CATEGORY_OPTIONS = [
  { value: "দোকান ভাড়া", label: "দোকান ভাড়া" },
  { value: "বিদ্যুৎ বিল", label: "বিদ্যুৎ বিল" },
  { value: "পরিবহন", label: "পরিবহন" },
  { value: "কর্মচারীর বেতন", label: "কর্মচারীর বেতন" },
  { value: "খাবার", label: "খাবার / চা-নাস্তা" },
  { value: "প্যাকেজিং", label: "প্যাকেজিং" },
  { value: "মেরামত", label: "মেরামত" },
  { value: "অন্যান্য", label: "অন্যান্য" },
];

export function ExpenseSheet({ visible, onClose }: Props) {
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();

  const [cat, setCat] = useState<string>(CATEGORY_OPTIONS[0]?.value ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      setCat(CATEGORY_OPTIONS[0]?.value ?? "");
      setAmount("");
      setNote("");
    }
  }, [visible]);

  const mut = useCreateExpense({
    mutation: {
      onSuccess: async () => {
        if (email) {
          await qc.invalidateQueries({
            queryKey: getListExpensesQueryKey(email),
          });
        }
        await qc.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return typeof key === "string" && key.includes("dashboard");
          },
        });
        show("খরচ যোগ হয়েছে", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        show(e?.response?.data?.error ?? "খরচ যোগ ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const submit = () => {
    if (!email) return;
    const a = Number(amount) || 0;
    if (!cat.trim()) {
      show("বিভাগ নির্বাচন করুন", "error");
      return;
    }
    if (a <= 0) {
      show("সঠিক টাকার পরিমাণ দিন", "error");
      return;
    }
    mut.mutate({
      email,
      data: {
        cat: cat.trim(),
        amount: a,
        note: note.trim() || undefined,
      },
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="নতুন খরচ">
      <Field label="খরচের বিভাগ">
        <FormSelect value={cat} onChange={setCat} options={CATEGORY_OPTIONS} />
      </Field>
      <FieldRow>
        <Field label="পরিমাণ (৳)" flex={1}>
          <FormInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="০"
            highlight
          />
        </Field>
      </FieldRow>
      <Field label="নোট">
        <FormInput
          value={note}
          onChangeText={setNote}
          placeholder="বিস্তারিত বা মন্তব্য..."
        />
      </Field>
      <SheetButtons
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="খরচ সংরক্ষণ ✓"
        busy={mut.isPending}
      />
    </Sheet>
  );
}

```

## `artifacts/mobile/components/PinKeypad.tsx`

```tsx
import { Delete } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const KEYS: (string | "back" | "")[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "",
  "0",
  "back",
];

type Props = {
  value: string;
  maxLength?: number;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function PinKeypad({
  value,
  maxLength = 6,
  onChange,
  disabled,
}: Props) {
  const colors = useColors();

  const press = (key: string | "back" | "") => {
    if (disabled) return;
    if (key === "") return;
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) return;
    onChange(value + key);
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((key, idx) => {
        const isBack = key === "back";
        const isEmpty = key === "";
        return (
          <View key={`${key}-${idx}`} style={styles.cell}>
            {isEmpty ? (
              <View style={styles.keyPlaceholder} />
            ) : (
              <Pressable
                onPress={() => press(key)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor: pressed
                      ? colors.cardElevated
                      : colors.card,
                    borderColor: colors.border,
                    opacity: disabled ? 0.5 : 1,
                  },
                ]}
              >
                {isBack ? (
                  <Delete size={22} color={colors.text} />
                ) : (
                  <Text style={[styles.keyText, { color: colors.text }]}>
                    {key}
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

type DotsProps = {
  filled: number;
  length?: number;
  error?: boolean;
};

export function PinDots({ filled, length = 4, error }: DotsProps) {
  const colors = useColors();
  return (
    <View style={styles.dots}>
      {Array.from({ length }).map((_, i) => {
        const on = i < filled;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: error
                  ? colors.destructive
                  : on
                    ? colors.accent
                    : "transparent",
                borderColor: error
                  ? colors.destructive
                  : on
                    ? colors.accent
                    : colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 280,
    alignSelf: "center",
  },
  cell: {
    width: "33.3333%",
    aspectRatio: 1.6,
    padding: 6,
  },
  key: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { cursor: "pointer" as const },
      default: {},
    }),
  },
  keyPlaceholder: {
    flex: 1,
  },
  keyText: {
    fontSize: 26,
    fontWeight: "600",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginVertical: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
  },
});

```

## `artifacts/mobile/components/PinSetupSheet.tsx`

```tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PinDots, PinKeypad } from "@/components/PinKeypad";
import { Sheet } from "@/components/Sheet";
import { SheetButtons } from "@/components/FormControls";
import { useAppLock } from "@/context/AppLockContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";

const PIN_LENGTH = 4;

export type PinSetupMode = "create" | "change" | "disable";

type Props = {
  visible: boolean;
  mode: PinSetupMode;
  onClose: () => void;
};

type Step = "current" | "new" | "confirm";

export function PinSetupSheet({ visible, mode, onClose }: Props) {
  const colors = useColors();
  const { show } = useToast();
  const { settings, setPin, disableLock } = useAppLock();

  const startingStep: Step =
    mode === "create" ? "new" : "current";

  const [step, setStep] = useState<Step>(startingStep);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep(mode === "create" ? "new" : "current");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setBusy(false);
    }
  }, [visible, mode]);

  const title =
    mode === "create"
      ? "নতুন পিন সেট করুন"
      : mode === "change"
        ? "পিন পরিবর্তন করুন"
        : "অ্যাপ লক বন্ধ করুন";

  const stepInfo = (() => {
    if (step === "current") {
      return { label: "বর্তমান পিন দিন", value: currentPin, set: setCurrentPin };
    }
    if (step === "new") {
      return { label: "নতুন পিন দিন", value: newPin, set: setNewPin };
    }
    return { label: "নতুন পিন আবার দিন", value: confirmPin, set: setConfirmPin };
  })();

  const proceed = async () => {
    if (busy) return;

    if (step === "current") {
      if (currentPin.length !== PIN_LENGTH) {
        show("পিন অসম্পূর্ণ", "error");
        return;
      }
      if (mode === "disable") {
        setBusy(true);
        try {
          await disableLock(currentPin);
          show("অ্যাপ লক বন্ধ হয়েছে", "success");
          onClose();
        } catch (e) {
          show((e as Error).message ?? "ব্যর্থ হয়েছে", "error");
          setCurrentPin("");
        } finally {
          setBusy(false);
        }
        return;
      }
      // mode === "change" — verify by attempting later. For now, just move on.
      setStep("new");
      return;
    }

    if (step === "new") {
      if (newPin.length !== PIN_LENGTH) {
        show("পিন অসম্পূর্ণ", "error");
        return;
      }
      setStep("confirm");
      return;
    }

    // step === "confirm"
    if (confirmPin.length !== PIN_LENGTH) {
      show("পিন অসম্পূর্ণ", "error");
      return;
    }
    if (confirmPin !== newPin) {
      show("দুটি পিন মিলছে না", "error");
      setConfirmPin("");
      return;
    }
    setBusy(true);
    try {
      if (mode === "create") {
        await setPin(newPin);
        show("পিন সেট হয়েছে", "success");
      } else {
        // change
        await setPin(newPin, currentPin);
        show("পিন পরিবর্তন হয়েছে", "success");
      }
      onClose();
    } catch (e) {
      show((e as Error).message ?? "ব্যর্থ হয়েছে", "error");
      // If old PIN was wrong, send back to that step.
      setStep(mode === "change" ? "current" : "new");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } finally {
      setBusy(false);
    }
  };

  const submitLabel =
    step === "confirm" || mode === "disable" ? "নিশ্চিত করুন" : "পরবর্তী";

  // Auto-submit "current" for disable as soon as it's full length isn't ideal because user might mistype.
  // Keep submit button as the explicit action.

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {stepInfo.label}
        </Text>
        <PinDots filled={stepInfo.value.length} length={PIN_LENGTH} />
        <PinKeypad
          value={stepInfo.value}
          maxLength={PIN_LENGTH}
          onChange={stepInfo.set}
          disabled={busy}
        />
        {settings.enabled && mode !== "create" ? (
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            ৪ অঙ্কের সংখ্যা ব্যবহার করুন
          </Text>
        ) : null}
      </View>
      <SheetButtons
        onCancel={onClose}
        onSubmit={proceed}
        submitLabel={submitLabel}
        busy={busy}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    paddingTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});

```

## `artifacts/mobile/components/LockScreen.tsx`

```tsx
import { Image } from "expo-image";
import { Fingerprint, Lock, ScanFace } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinDots, PinKeypad } from "@/components/PinKeypad";
import { useAppLock } from "@/context/AppLockContext";
import { useColors } from "@/hooks/useColors";

const PIN_LENGTH = 4;

export function LockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    state,
    settings,
    biometricAvailable,
    biometricLabel,
    unlockWithPin,
    unlockWithBiometric,
  } = useAppLock();

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const triedAutoBio = useRef(false);

  const useBiometric =
    biometricAvailable && settings.biometricEnabled && Platform.OS !== "web";

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 1,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -1,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 1,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // When the PIN reaches required length, attempt unlock.
  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      const ok = await unlockWithPin(pin);
      if (cancelled) return;
      if (!ok) {
        setError(true);
        triggerShake();
        setTimeout(() => {
          if (!cancelled) {
            setPin("");
            setError(false);
          }
        }, 600);
      }
      setBusy(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  // Auto-prompt biometric once on mount when allowed.
  useEffect(() => {
    if (!useBiometric) return;
    if (state !== "locked") return;
    if (triedAutoBio.current) return;
    triedAutoBio.current = true;
    unlockWithBiometric();
  }, [useBiometric, state, unlockWithBiometric]);

  const onTapBiometric = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await unlockWithBiometric();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.top}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={[styles.title, { color: colors.accent }]}>FabricGhar</Text>
        <View
          style={[
            styles.lockBadge,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Lock size={14} color={colors.mutedForeground} />
          <Text
            style={[styles.lockBadgeText, { color: colors.mutedForeground }]}
          >
            অ্যাপ লক করা আছে
          </Text>
        </View>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          আনলক করতে আপনার ৪ অঙ্কের পিন দিন
        </Text>
      </View>

      <Animated.View
        style={{
          transform: [
            {
              translateX: shake.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-12, 0, 12],
              }),
            },
          ],
        }}
      >
        <PinDots filled={pin.length} length={PIN_LENGTH} error={error} />
        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            ভুল পিন, আবার চেষ্টা করুন
          </Text>
        ) : null}
      </Animated.View>

      <View style={styles.bottom}>
        <PinKeypad
          value={pin}
          maxLength={PIN_LENGTH}
          onChange={setPin}
          disabled={busy}
        />
        {useBiometric ? (
          <Pressable
            onPress={onTapBiometric}
            disabled={busy}
            style={({ pressed }) => [
              styles.bioBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.cardElevated,
                opacity: pressed || busy ? 0.7 : 1,
              },
            ]}
          >
            {biometricLabel === "Face ID" ? (
              <ScanFace size={18} color={colors.accent} />
            ) : (
              <Fingerprint size={18} color={colors.accent} />
            )}
            <Text style={[styles.bioBtnText, { color: colors.text }]}>
              {biometricLabel} দিয়ে আনলক করুন
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  top: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  logo: { width: 80, height: 80 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
  },
  lockBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -8,
    marginBottom: 8,
  },
  bottom: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 8,
    gap: 16,
  },
  bioBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  bioBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

```

---

# মোবাইল অ্যাপ - স্ক্রিন (Tabs)


## `artifacts/mobile/app/_layout.tsx`

```tsx
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EmailGate } from "@/components/EmailGate";
import { LockScreen } from "@/components/LockScreen";
import { AppLockProvider, useAppLock } from "@/context/AppLockContext";
import { ShopProvider, useShop } from "@/context/ShopContext";
import { ToastProvider } from "@/context/ToastContext";

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
  },
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

function RootLayoutNav() {
  const { ready, email } = useShop();
  const { state: lockState } = useAppLock();
  if (!ready) return null;
  if (!email) return <EmailGate />;
  if (lockState === "checking") return null;
  if (lockState === "locked") return <LockScreen />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <ShopProvider>
                <AppLockProvider>
                  <ToastProvider>
                    <StatusBar style="light" />
                    <RootLayoutNav />
                  </ToastProvider>
                </AppLockProvider>
              </ShopProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

```

## `artifacts/mobile/app/(tabs)/_layout.tsx`

```tsx
import { Tabs } from "expo-router";
import {
  BarChart3,
  Home,
  Package,
  Settings,
  ShoppingBag,
  Wallet,
} from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.card },
            ]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "হোম",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "পণ্য",
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "বিক্রয়",
          tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "খরচ",
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "রিপোর্ট",
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "সেটিংস",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

```

## `artifacts/mobile/app/(tabs)/index.tsx`

```tsx
import { useGetDashboard } from "@workspace/api-client-react";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header } from "@/components/Header";
import { SaleSheet } from "@/components/SaleSheet";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useColors } from "@/hooks/useColors";
import { fmt, tk } from "@/lib/format";

export default function DashboardScreen() {
  const colors = useColors();
  const { email } = useShop();
  const [showSale, setShowSale] = useState(false);

  const dash = useGetDashboard(email ?? "");

  const onRefresh = useCallback(() => {
    dash.refetch();
  }, [dash]);

  const data = dash.data;
  const sales = data?.todaySales ?? [];

  const cards = [
    {
      label: "আজকের বিক্রয়",
      value: tk(data?.todayRevenue ?? 0),
      tone: colors.info,
    },
    {
      label: "আজকের লাভ",
      value: tk(data?.todayProfit ?? 0),
      tone: colors.success,
    },
    {
      label: "মোট বিক্রয়",
      value: tk(data?.totalRevenue ?? 0),
      tone: colors.info,
    },
    {
      label: "মোট লাভ",
      value: tk(data?.totalProfit ?? 0),
      tone: colors.success,
    },
    {
      label: "মোট পণ্য",
      value: `${fmt(data?.productCount ?? 0)} টি`,
      tone: colors.accent,
    },
    {
      label: "কম স্টক",
      value: `${fmt(data?.lowStockCount ?? 0)} টি`,
      tone:
        (data?.lowStockCount ?? 0) > 0 ? colors.destructive : colors.accent,
    },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSale(true)} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={dash.isFetching && !dash.isLoading}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {dash.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {cards.map((c) => (
                <View
                  key={c.label}
                  style={[
                    styles.sumCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text
                    style={[styles.sumLabel, { color: colors.mutedForeground }]}
                  >
                    {c.label}
                  </Text>
                  <Text style={[styles.sumValue, { color: c.tone }]}>
                    {c.value}
                  </Text>
                </View>
              ))}
            </View>

            <SectionTitle>আজকের বিক্রয়</SectionTitle>
            {sales.length === 0 ? (
              <Empty
                text="আজ এখনো কোনো বিক্রয় নেই।"
                hint='উপরের "+ বিক্রয়" বাটনে ক্লিক করুন।'
              />
            ) : (
              <Card>
                {sales.map((s, idx) => (
                  <View
                    key={s.id}
                    style={[
                      styles.saleRow,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth: idx === sales.length - 1 ? 0 : 1,
                      },
                    ]}
                  >
                    <View style={styles.saleLeft}>
                      <Text style={[styles.saleName, { color: colors.text }]}>
                        {s.pname}
                      </Text>
                      <Text
                        style={[
                          styles.saleMeta,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {fmt(s.qty)} পিস × {tk(s.price)}
                        {s.note ? ` · ${s.note}` : ""}
                      </Text>
                    </View>
                    <View style={styles.saleRight}>
                      <Text
                        style={[styles.salePrice, { color: colors.accent }]}
                      >
                        {tk(s.total)}
                      </Text>
                      <Badge tone="green">লাভ: {tk(s.profit)}</Badge>
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <SaleSheet visible={showSale} onClose={() => setShowSale(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loading: {
    paddingVertical: 60,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  sumCard: {
    flexBasis: "48%",
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  sumLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  sumValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  saleRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },
  saleLeft: { flex: 1 },
  saleRight: { alignItems: "flex-end", gap: 4 },
  saleName: {
    fontSize: 14,
    fontWeight: "600",
  },
  saleMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  salePrice: {
    fontSize: 14,
    fontWeight: "700",
  },
});

```

## `artifacts/mobile/app/(tabs)/products.tsx`

```tsx
import { useQueryClient } from "@tanstack/react-query";
import {
  getListProductsQueryKey,
  useDeleteProduct,
  useListProducts,
  type Product,
} from "@workspace/api-client-react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Header } from "@/components/Header";
import { ProductSheet } from "@/components/ProductSheet";
import { SaleSheet } from "@/components/SaleSheet";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { fmt, tk } from "@/lib/format";

export default function ProductsScreen() {
  const colors = useColors();
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();
  const [showProd, setShowProd] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const list = useListProducts(email ?? "");
  const allProducts = list.data ?? [];

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q),
    );
  }, [allProducts, query]);

  const deleteMut = useDeleteProduct({
    mutation: {
      onSuccess: async () => {
        if (email) {
          await qc.invalidateQueries({
            queryKey: getListProductsQueryKey(email),
          });
        }
        await qc.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return (
              typeof key === "string" &&
              (key.includes("dashboard") || key.includes("report"))
            );
          },
        });
        show("পণ্য মুছে ফেলা হয়েছে", "success");
      },
      onError: () => show("মুছে ফেলা যায়নি", "error"),
      onSettled: () => setDeletingId(null),
    },
  });

  const onAdd = () => {
    setEditing(null);
    setShowProd(true);
  };

  const onEdit = (p: Product) => {
    setEditing(p);
    setShowProd(true);
  };

  const onDelete = (p: Product) => {
    if (!email) return;
    const run = () => {
      setDeletingId(p.id);
      deleteMut.mutate({ email, id: p.id });
    };
    if (Platform.OS === "web") {
      if (window.confirm(`"${p.name}" পণ্যটি মুছে ফেলবেন?`)) run();
      return;
    }
    Alert.alert(
      "পণ্য মুছে ফেলবেন?",
      `"${p.name}" স্থায়ীভাবে মুছে যাবে।`,
      [
        { text: "বাতিল", style: "cancel" },
        { text: "মুছে ফেলুন", style: "destructive", onPress: run },
      ],
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSale(true)} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={list.isFetching && !list.isLoading}
            onRefresh={list.refetch}
            tintColor={colors.accent}
          />
        }
      >
        <SectionTitle
          right={
            <Pressable
              onPress={onAdd}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius - 2,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Plus size={14} color="#000" strokeWidth={3} />
              <Text style={styles.addText}>যোগ করুন</Text>
            </Pressable>
          }
        >
          পণ্য তালিকা
        </SectionTitle>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Search size={16} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="পণ্যের নাম বা ক্যাটাগরি দিয়ে খুঁজুন"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.text }]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <X size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        {list.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : allProducts.length === 0 ? (
          <Empty
            text="কোনো পণ্য নেই।"
            hint='উপরের "+ যোগ করুন" বাটনে ক্লিক করুন।'
          />
        ) : products.length === 0 ? (
          <Empty
            text="কিছু পাওয়া যায়নি।"
            hint="অন্য নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।"
          />
        ) : (
          <Card>
            {products.map((p, idx) => {
              const tone =
                p.stock <= 0
                  ? "red"
                  : p.stock <= 5
                    ? "amber"
                    : "green";
              return (
                <View
                  key={p.id}
                  style={[
                    styles.row,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: idx === products.length - 1 ? 0 : 1,
                    },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={[styles.name, { color: colors.text }]}>
                      {p.name}
                    </Text>
                    <Text
                      style={[
                        styles.meta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {p.cat} · ক্রয়: {tk(p.buy)}
                    </Text>
                    <View style={styles.actionsRow}>
                      <Pressable
                        onPress={() => onEdit(p)}
                        style={({ pressed }) => [
                          styles.editBtn,
                          {
                            backgroundColor: colors.cardElevated,
                            borderColor: colors.border,
                            borderRadius: 6,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Pencil size={12} color={colors.text} />
                        <Text
                          style={[styles.editText, { color: colors.text }]}
                        >
                          সম্পাদনা
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onDelete(p)}
                        disabled={deletingId === p.id}
                        style={({ pressed }) => [
                          styles.editBtn,
                          {
                            backgroundColor: colors.cardElevated,
                            borderColor: colors.destructive,
                            borderRadius: 6,
                            opacity:
                              pressed || deletingId === p.id ? 0.6 : 1,
                          },
                        ]}
                      >
                        {deletingId === p.id ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.destructive}
                          />
                        ) : (
                          <>
                            <Trash2
                              size={12}
                              color={colors.destructive}
                              strokeWidth={2.4}
                            />
                            <Text
                              style={[
                                styles.editText,
                                { color: colors.destructive },
                              ]}
                            >
                              মুছুন
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={[styles.price, { color: colors.accent }]}>
                      {tk(p.sell)}
                    </Text>
                    <Badge tone={tone}>{fmt(p.stock)} পিস</Badge>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <ProductSheet
        visible={showProd}
        onClose={() => setShowProd(false)}
        editing={editing}
      />
      <SaleSheet visible={showSale} onClose={() => setShowSale(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loading: { paddingVertical: 60, alignItems: "center" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
    ...Platform.select({
      web: { outlineWidth: 0 } as object,
      default: {},
    }),
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rowLeft: { flex: 1, gap: 4 },
  rowRight: { alignItems: "flex-end", gap: 6 },
  name: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 12 },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  editText: { fontSize: 12, fontWeight: "500" },
  price: { fontSize: 14, fontWeight: "700" },
});

```

## `artifacts/mobile/app/(tabs)/sales.tsx`

```tsx
import { useQueryClient } from "@tanstack/react-query";
import {
  getListProductsQueryKey,
  getListSalesQueryKey,
  useDeleteSale,
  useListSales,
  type Sale,
} from "@workspace/api-client-react";
import { Pencil, Trash2 } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FormSelect } from "@/components/FormControls";
import { Header } from "@/components/Header";
import { SaleSheet } from "@/components/SaleSheet";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { bnDate, bnMonth, fmt, tk } from "@/lib/format";

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

export default function SalesScreen() {
  const colors = useColors();
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();
  const [showSale, setShowSale] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const list = useListSales(email ?? "");
  const sales = list.data ?? [];

  const deleteMut = useDeleteSale({
    mutation: {
      onSuccess: async () => {
        if (email) {
          await qc.invalidateQueries({
            queryKey: getListSalesQueryKey(email),
          });
          await qc.invalidateQueries({
            queryKey: getListProductsQueryKey(email),
          });
        }
        await qc.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return (
              typeof key === "string" &&
              (key.includes("dashboard") || key.includes("report"))
            );
          },
        });
        show("বিক্রয় মুছে ফেলা হয়েছে", "success");
      },
      onError: () => show("মুছে ফেলা যায়নি", "error"),
      onSettled: () => setDeletingId(null),
    },
  });

  const onEdit = (s: Sale) => {
    setEditing(s);
    setShowSale(true);
  };

  const onNewSale = () => {
    setEditing(null);
    setShowSale(true);
  };

  const onDelete = (s: Sale) => {
    if (!email) return;
    const run = () => {
      setDeletingId(s.id);
      deleteMut.mutate({ email, id: s.id });
    };
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `"${s.pname}" বিক্রয়টি মুছে ফেলবেন? স্টক পুনরুদ্ধার হবে।`,
        )
      )
        run();
      return;
    }
    Alert.alert(
      "বিক্রয় মুছে ফেলবেন?",
      `"${s.pname}" বিক্রয়টি মুছে গেলে স্টকে ${fmt(s.qty)} পিস ফিরে আসবে।`,
      [
        { text: "বাতিল", style: "cancel" },
        { text: "মুছে ফেলুন", style: "destructive", onPress: run },
      ],
    );
  };

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const s of sales) set.add(ymd(new Date(s.date)));
    return [...set].sort().reverse();
  }, [sales]);

  const monthOptions = useMemo(
    () => [
      { value: "", label: "সব মাস" },
      ...months.map((m) => ({ value: m, label: bnMonth(m) })),
    ],
    [months],
  );

  const filtered = useMemo(() => {
    if (!filter) return sales;
    return sales.filter((s) => ymd(new Date(s.date)) === filter);
  }, [sales, filter]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={onNewSale} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={list.isFetching && !list.isLoading}
            onRefresh={list.refetch}
            tintColor={colors.accent}
          />
        }
      >
        <SectionTitle>বিক্রয় ইতিহাস</SectionTitle>
        <View style={styles.filter}>
          <FormSelect
            value={filter}
            onChange={setFilter}
            options={monthOptions}
          />
        </View>

        {list.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : filtered.length === 0 ? (
          <Empty text="কোনো বিক্রয় পাওয়া যায়নি।" />
        ) : (
          <Card>
            {filtered.map((s, idx) => (
              <View
                key={s.id}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx === filtered.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.left}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {s.pname}
                  </Text>
                  <Text
                    style={[styles.meta, { color: colors.mutedForeground }]}
                  >
                    {bnDate(s.date)} · {fmt(s.qty)} পিস
                    {s.note ? ` · ${s.note}` : ""}
                  </Text>
                  <View style={styles.actionsRow}>
                    <Pressable
                      onPress={() => onEdit(s)}
                      style={({ pressed }) => [
                        styles.editBtn,
                        {
                          backgroundColor: colors.cardElevated,
                          borderColor: colors.border,
                          borderRadius: 6,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Pencil size={12} color={colors.text} />
                      <Text style={[styles.editText, { color: colors.text }]}>
                        সম্পাদনা
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onDelete(s)}
                      disabled={deletingId === s.id}
                      style={({ pressed }) => [
                        styles.editBtn,
                        {
                          backgroundColor: colors.cardElevated,
                          borderColor: colors.destructive,
                          borderRadius: 6,
                          opacity:
                            pressed || deletingId === s.id ? 0.6 : 1,
                        },
                      ]}
                    >
                      {deletingId === s.id ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.destructive}
                        />
                      ) : (
                        <>
                          <Trash2
                            size={12}
                            color={colors.destructive}
                            strokeWidth={2.4}
                          />
                          <Text
                            style={[
                              styles.editText,
                              { color: colors.destructive },
                            ]}
                          >
                            মুছুন
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.price, { color: colors.accent }]}>
                    {tk(s.total)}
                  </Text>
                  <Badge tone="green">৳{fmt(s.profit)}</Badge>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <SaleSheet
        visible={showSale}
        onClose={() => setShowSale(false)}
        editing={editing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  loading: { paddingVertical: 60, alignItems: "center" },
  filter: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  left: { flex: 1, gap: 4 },
  right: { alignItems: "flex-end", gap: 4 },
  name: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 14, fontWeight: "700" },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  editText: { fontSize: 12, fontWeight: "500" },
});

```

## `artifacts/mobile/app/(tabs)/expenses.tsx`

```tsx
import { useQueryClient } from "@tanstack/react-query";
import {
  getListExpensesQueryKey,
  useDeleteExpense,
  useListExpenses,
} from "@workspace/api-client-react";
import { Plus, Trash2 } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ExpenseSheet } from "@/components/ExpenseSheet";
import { FormSelect } from "@/components/FormControls";
import { Header } from "@/components/Header";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { bnDate, bnMonth, tk } from "@/lib/format";

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

export default function ExpensesScreen() {
  const colors = useColors();
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();

  const [showSheet, setShowSheet] = useState(false);
  const [filter, setFilter] = useState("");

  const list = useListExpenses(email ?? "");
  const expenses = list.data ?? [];

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) set.add(ymd(new Date(e.date)));
    return [...set].sort().reverse();
  }, [expenses]);

  const monthOptions = useMemo(
    () => [
      { value: "", label: "সব মাস" },
      ...months.map((m) => ({ value: m, label: bnMonth(m) })),
    ],
    [months],
  );

  const filtered = useMemo(() => {
    if (!filter) return expenses;
    return expenses.filter((e) => ymd(new Date(e.date)) === filter);
  }, [expenses, filter]);

  const totalShown = useMemo(
    () => filtered.reduce((acc, e) => acc + Number(e.amount), 0),
    [filtered],
  );

  const today = new Date().toDateString();
  const todayTotal = useMemo(
    () =>
      expenses
        .filter((e) => new Date(e.date).toDateString() === today)
        .reduce((acc, e) => acc + Number(e.amount), 0),
    [expenses, today],
  );

  const delMut = useDeleteExpense({
    mutation: {
      onSuccess: async () => {
        if (email) {
          await qc.invalidateQueries({
            queryKey: getListExpensesQueryKey(email),
          });
        }
        await qc.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return typeof key === "string" && key.includes("dashboard");
          },
        });
        show("খরচ মুছে ফেলা হয়েছে", "success");
      },
      onError: () => {
        show("মুছে ফেলা ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const onDelete = (id: string, label: string) => {
    if (!email) return;
    const doDelete = () => delMut.mutate({ email, id });

    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      const ok = window.confirm(`"${label}" খরচটি মুছে ফেলবেন?`);
      if (ok) doDelete();
      return;
    }
    Alert.alert(
      "খরচ মুছবেন?",
      `"${label}" খরচটি স্থায়ীভাবে মুছে যাবে।`,
      [
        { text: "বাতিল", style: "cancel" },
        { text: "মুছুন", style: "destructive", onPress: doDelete },
      ],
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSheet(true)} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={list.isFetching && !list.isLoading}
            onRefresh={list.refetch}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summary,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              আজকের খরচ
            </Text>
            <Text style={[styles.summaryValue, { color: colors.destructive }]}>
              {tk(todayTotal)}
            </Text>
          </View>
          <View
            style={[
              styles.summary,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {filter ? "মাসের মোট" : "সর্বমোট খরচ"}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.destructive }]}>
              {tk(totalShown)}
            </Text>
          </View>
        </View>

        <SectionTitle
          right={
            <Pressable
              onPress={() => setShowSheet(true)}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius - 2,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Plus size={14} color="#000" strokeWidth={3} />
              <Text style={styles.addBtnText}>নতুন খরচ</Text>
            </Pressable>
          }
        >
          খরচের ইতিহাস
        </SectionTitle>

        <View style={styles.filter}>
          <FormSelect
            value={filter}
            onChange={setFilter}
            options={monthOptions}
          />
        </View>

        {list.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : filtered.length === 0 ? (
          <Empty
            text="কোনো খরচ পাওয়া যায়নি।"
            hint='উপরের "নতুন খরচ" বাটনে ক্লিক করুন।'
          />
        ) : (
          <Card>
            {filtered.map((e, idx) => (
              <View
                key={e.id}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx === filtered.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.left}>
                  <Text style={[styles.cat, { color: colors.text }]}>
                    {e.cat}
                  </Text>
                  <Text
                    style={[styles.meta, { color: colors.mutedForeground }]}
                  >
                    {bnDate(e.date)}
                    {e.note ? ` · ${e.note}` : ""}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text
                    style={[styles.amount, { color: colors.destructive }]}
                  >
                    -{tk(e.amount)}
                  </Text>
                  <Pressable
                    onPress={() => onDelete(e.id, e.cat)}
                    hitSlop={8}
                    style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                  >
                    <Trash2 size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <ExpenseSheet visible={showSheet} onClose={() => setShowSheet(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  summary: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  filter: {
    marginBottom: 12,
  },
  loading: {
    paddingVertical: 60,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },
  left: { flex: 1 },
  right: {
    alignItems: "flex-end",
    gap: 6,
    flexDirection: "row",
  },
  cat: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 12,
  },
});

```

## `artifacts/mobile/app/(tabs)/report.tsx`

```tsx
import { useGetReport } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header } from "@/components/Header";
import { SaleSheet } from "@/components/SaleSheet";
import { Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useColors } from "@/hooks/useColors";
import { bnMonth, fmt, tk } from "@/lib/format";

export default function ReportScreen() {
  const colors = useColors();
  const { email } = useShop();
  const [showSale, setShowSale] = useState(false);

  const r = useGetReport(email ?? "");
  const data = r.data;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSale(true)} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={r.isFetching && !r.isLoading}
            onRefresh={r.refetch}
            tintColor={colors.accent}
          />
        }
      >
        <SectionTitle>হিসাব রিপোর্ট</SectionTitle>

        {r.isLoading || !data ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <ReportBlock title="সামগ্রিক হিসাব">
              <Row k="মোট বিক্রয়" v={tk(data.totalRevenue)} tone={colors.info} />
              <Row
                k="মোট খরচ"
                v={tk(data.totalCost)}
                tone={colors.destructive}
                last={false}
              />
              <Row
                k="মোট লাভ"
                v={tk(data.totalProfit)}
                tone={colors.success}
              />
              <Row
                k="লাভের হার"
                v={`${fmt(data.profitMargin)}%`}
                tone={colors.accent}
                last
              />
            </ReportBlock>

            <ReportBlock title="মাস অনুযায়ী">
              {data.byMonth.length === 0 ? (
                <Empty text="কোনো তথ্য নেই" />
              ) : (
                data.byMonth.map((m, i) => (
                  <DualRow
                    key={m.month}
                    keyTop={bnMonth(m.month)}
                    keyBottom={`${fmt(m.count)} টি বিক্রয়`}
                    valTop={tk(m.revenue)}
                    valBottom={`লাভ: ${tk(m.profit)}`}
                    last={i === data.byMonth.length - 1}
                  />
                ))
              )}
            </ReportBlock>

            <ReportBlock title="সেরা পণ্য (লাভ অনুযায়ী)">
              {data.topProducts.length === 0 ? (
                <Empty text="কোনো তথ্য নেই" />
              ) : (
                data.topProducts.map((p, i) => (
                  <DualRow
                    key={p.name}
                    keyTop={p.name}
                    keyBottom={`${fmt(p.qty)} পিস বিক্রি`}
                    valTop={tk(p.revenue)}
                    valBottom={`লাভ: ${tk(p.profit)}`}
                    last={i === data.topProducts.length - 1}
                  />
                ))
              )}
            </ReportBlock>
          </>
        )}
      </ScrollView>

      <SaleSheet visible={showSale} onClose={() => setShowSale(false)} />
    </View>
  );
}

function ReportBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.block,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View
        style={[
          styles.blockTitle,
          {
            backgroundColor: colors.cardElevated,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[styles.blockTitleText, { color: colors.mutedForeground }]}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Row({
  k,
  v,
  tone,
  last,
}: {
  k: string;
  v: string;
  tone: string;
  last?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: last ? 0 : 1,
        },
      ]}
    >
      <Text style={[styles.rowKey, { color: colors.mutedForeground }]}>
        {k}
      </Text>
      <Text style={[styles.rowVal, { color: tone }]}>{v}</Text>
    </View>
  );
}

function DualRow({
  keyTop,
  keyBottom,
  valTop,
  valBottom,
  last,
}: {
  keyTop: string;
  keyBottom: string;
  valTop: string;
  valBottom: string;
  last?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: last ? 0 : 1,
          alignItems: "flex-start",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowKey, { color: colors.text, fontWeight: "500" }]}>
          {keyTop}
        </Text>
        <Text style={[styles.rowKeySmall, { color: colors.mutedForeground }]}>
          {keyBottom}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.rowVal, { color: colors.info }]}>{valTop}</Text>
        <Text style={[styles.rowKeySmall, { color: colors.success }]}>
          {valBottom}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  loading: { paddingVertical: 60, alignItems: "center" },
  block: {
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  blockTitle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  blockTitleText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowKey: {
    fontSize: 14,
  },
  rowKeySmall: {
    fontSize: 11,
    marginTop: 2,
  },
  rowVal: {
    fontSize: 14,
    fontWeight: "700",
  },
});

```

## `artifacts/mobile/app/(tabs)/settings.tsx`

```tsx
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Copy,
  Download,
  FileSpreadsheet,
  Fingerprint,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from "lucide-react-native";
import {
  getBackup,
  restoreBackup,
  type BackupSnapshot,
} from "@workspace/api-client-react";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinSetupSheet, type PinSetupMode } from "@/components/PinSetupSheet";
import { useAppLock } from "@/context/AppLockContext";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { fmt } from "@/lib/format";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { email, signOut } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<
    null | "backup" | "restore" | "share" | "excel"
  >(null);
  const {
    settings: lockSettings,
    biometricAvailable,
    biometricLabel,
    setBiometricEnabled,
    lockNow,
  } = useAppLock();
  const [pinSheet, setPinSheet] = useState<{
    visible: boolean;
    mode: PinSetupMode;
  }>({ visible: false, mode: "create" });

  if (!email) return null;

  const lockEnabled = lockSettings.enabled && !!lockSettings.pinHash;

  const haptic = async () => {
    if (Platform.OS !== "web") {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }
  };

  const onToggleLock = (next: boolean) => {
    if (next) {
      setPinSheet({ visible: true, mode: "create" });
    } else {
      setPinSheet({ visible: true, mode: "disable" });
    }
  };

  const onChangePin = () => setPinSheet({ visible: true, mode: "change" });

  const onToggleBiometric = async (next: boolean) => {
    if (next && !biometricAvailable) {
      show("এই ডিভাইসে বায়োমেট্রিক চালু নেই", "error");
      return;
    }
    await setBiometricEnabled(next);
    show(
      next ? `${biometricLabel} চালু হয়েছে` : `${biometricLabel} বন্ধ হয়েছে`,
      "success",
    );
  };

  const onLockNow = async () => {
    await haptic();
    if (!lockEnabled) {
      show("আগে অ্যাপ লক চালু করুন", "error");
      return;
    }
    lockNow();
  };

  const onCopyEmail = async () => {
    await haptic();
    await Clipboard.setStringAsync(email);
    show("ইমেইল কপি হয়েছে", "success");
  };

  const onBackup = async () => {
    if (!email) return;
    setBusy("backup");
    try {
      const data = (await getBackup(email)) as BackupSnapshot;
      const json = JSON.stringify(data, null, 2);
      const filename = `fabricghar-backup-${Date.now()}.json`;

      if (Platform.OS === "web") {
        await Clipboard.setStringAsync(json);
        show("ব্যাকআপ ক্লিপবোর্ডে কপি হয়েছে", "success");
      } else {
        const uri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(uri, json);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/json",
            dialogTitle: "ব্যাকআপ সংরক্ষণ করুন",
            UTI: "public.json",
          });
        } else {
          show(`ফাইল সংরক্ষিত: ${filename}`, "success");
        }
      }
    } catch {
      show("ব্যাকআপ ব্যর্থ হয়েছে", "error");
    } finally {
      setBusy(null);
    }
  };

  const onExportExcel = async () => {
    if (!email) return;
    setBusy("excel");
    try {
      const data = (await getBackup(email)) as BackupSnapshot;

      const productRows = (data.products ?? []).map((p) => ({
        নাম: p.name,
        ক্যাটাগরি: p.cat,
        "ক্রয় মূল্য": Number(p.buy) || 0,
        "বিক্রয় মূল্য": Number(p.sell) || 0,
        স্টক: Number(p.stock) || 0,
      }));

      const saleRows = (data.sales ?? []).map((s) => {
        const d = new Date(s.date);
        return {
          তারিখ: isNaN(d.getTime()) ? s.date : d.toISOString().slice(0, 10),
          পণ্য: s.pname,
          পরিমাণ: Number(s.qty) || 0,
          "একক মূল্য": Number(s.price) || 0,
          "ক্রয় মূল্য": Number(s.buy) || 0,
          ছাড়: Number(s.disc) || 0,
          মোট: Number(s.total) || 0,
          লাভ: Number(s.profit) || 0,
          নোট: s.note ?? "",
        };
      });

      const expenseRows = (data.expenses ?? []).map((e) => {
        const d = new Date(e.date);
        return {
          তারিখ: isNaN(d.getTime()) ? e.date : d.toISOString().slice(0, 10),
          ক্যাটাগরি: e.cat,
          পরিমাণ: Number(e.amount) || 0,
          নোট: e.note ?? "",
        };
      });

      const wb = XLSX.utils.book_new();
      const wsProducts = XLSX.utils.json_to_sheet(
        productRows.length
          ? productRows
          : [
              {
                নাম: "",
                ক্যাটাগরি: "",
                "ক্রয় মূল্য": "",
                "বিক্রয় মূল্য": "",
                স্টক: "",
              },
            ],
      );
      const wsSales = XLSX.utils.json_to_sheet(
        saleRows.length
          ? saleRows
          : [
              {
                তারিখ: "",
                পণ্য: "",
                পরিমাণ: "",
                "একক মূল্য": "",
                "ক্রয় মূল্য": "",
                ছাড়: "",
                মোট: "",
                লাভ: "",
                নোট: "",
              },
            ],
      );
      const wsExpenses = XLSX.utils.json_to_sheet(
        expenseRows.length
          ? expenseRows
          : [{ তারিখ: "", ক্যাটাগরি: "", পরিমাণ: "", নোট: "" }],
      );
      XLSX.utils.book_append_sheet(wb, wsProducts, "পণ্য");
      XLSX.utils.book_append_sheet(wb, wsSales, "বিক্রয়");
      XLSX.utils.book_append_sheet(wb, wsExpenses, "খরচ");

      const filename = `fabricghar-${new Date().toISOString().slice(0, 10)}.xlsx`;

      if (Platform.OS === "web") {
        const arrayBuf = XLSX.write(wb, {
          type: "array",
          bookType: "xlsx",
        }) as ArrayBuffer;
        const blob = new Blob([arrayBuf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        show("Excel ফাইল ডাউনলোড হয়েছে", "success");
      } else {
        const base64 = XLSX.write(wb, {
          type: "base64",
          bookType: "xlsx",
        }) as string;
        const uri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Excel ফাইল সংরক্ষণ করুন",
            UTI: "org.openxmlformats.spreadsheetml.sheet",
          });
        } else {
          show(`ফাইল সংরক্ষিত: ${filename}`, "success");
        }
      }
    } catch {
      show("Excel ফাইল তৈরি ব্যর্থ হয়েছে", "error");
    } finally {
      setBusy(null);
    }
  };

  const onRestore = async () => {
    if (!email) return;
    const proceed = () => {
      Alert.alert(
        "ডেটা পুনরুদ্ধার",
        "এটি বর্তমান সব ডেটা মুছে ফেলে ব্যাকআপ থেকে নতুন ডেটা সেট করবে। চালিয়ে যাবেন?",
        [
          { text: "বাতিল", style: "cancel" },
          {
            text: "চালিয়ে যান",
            style: "destructive",
            onPress: async () => {
              setBusy("restore");
              try {
                const result = await DocumentPicker.getDocumentAsync({
                  type: ["application/json", "*/*"],
                  copyToCacheDirectory: true,
                });
                if (result.canceled || !result.assets?.[0]) {
                  setBusy(null);
                  return;
                }
                const uri = result.assets[0].uri;
                const text =
                  Platform.OS === "web"
                    ? await (await fetch(uri)).text()
                    : await FileSystem.readAsStringAsync(uri);
                const parsed = JSON.parse(text) as BackupSnapshot;
                if (
                  !Array.isArray(parsed.products) ||
                  !Array.isArray(parsed.sales)
                ) {
                  show("অবৈধ ব্যাকআপ ফাইল", "error");
                  setBusy(null);
                  return;
                }
                const res = (await restoreBackup(email, parsed)) as {
                  products: number;
                  sales: number;
                };
                await qc.invalidateQueries();
                show(
                  `${fmt(res.products)} পণ্য ও ${fmt(res.sales)} বিক্রয় পুনরুদ্ধার হয়েছে`,
                  "success",
                );
              } catch {
                show("পুনরুদ্ধার ব্যর্থ হয়েছে", "error");
              } finally {
                setBusy(null);
              }
            },
          },
        ],
      );
    };
    proceed();
  };

  const onSignOut = () => {
    Alert.alert(
      "অ্যাকাউন্ট পরিবর্তন",
      "আপনি কি অন্য ইমেইল দিয়ে লগইন করতে চান? ক্লাউড ডেটা মুছে যাবে না।",
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "লগ আউট",
          style: "destructive",
          onPress: () => {
            signOut();
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.flex,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.brandTitle, { color: colors.accent }]}>
            FabricGhar
          </Text>
          <Text style={[styles.brandTag, { color: colors.mutedForeground }]}>
            কাপড়ের দোকানের সম্পূর্ণ হিসাব
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          ব্যাকআপ ও পুনরুদ্ধার
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Action
            Icon={Download}
            title="ডেটা ব্যাকআপ"
            subtitle="JSON ফাইল হিসেবে সংরক্ষণ করুন বা শেয়ার করুন"
            onPress={onBackup}
            busy={busy === "backup"}
          />
          <Divider />
          <Action
            Icon={FileSpreadsheet}
            title="Excel/CSV ডাউনলোড"
            subtitle="পণ্য, বিক্রয় ও খরচ - তিনটি শীটে .xlsx ফাইল"
            onPress={onExportExcel}
            busy={busy === "excel"}
          />
          <Divider />
          <Action
            Icon={Upload}
            title="ব্যাকআপ থেকে পুনরুদ্ধার"
            subtitle="JSON ফাইল থেকে ডেটা ফিরিয়ে আনুন"
            onPress={onRestore}
            busy={busy === "restore"}
            tone="warn"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          নিরাপত্তা
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <ToggleRow
            Icon={ShieldCheck}
            title="অ্যাপ লক"
            subtitle={
              lockEnabled
                ? "অ্যাপ খুললেই পিন চাইবে"
                : "৪ অঙ্কের পিন দিয়ে অ্যাপ সুরক্ষিত করুন"
            }
            value={lockEnabled}
            onValueChange={onToggleLock}
          />
          {lockEnabled ? (
            <>
              <Divider />
              <Action
                Icon={KeyRound}
                title="পিন পরিবর্তন করুন"
                subtitle="নতুন ৪ অঙ্কের পিন সেট করুন"
                onPress={onChangePin}
              />
              {biometricAvailable ? (
                <>
                  <Divider />
                  <ToggleRow
                    Icon={Fingerprint}
                    title={`${biometricLabel} আনলক`}
                    subtitle={`পিনের পাশাপাশি ${biometricLabel} দিয়েও আনলক করা যাবে`}
                    value={lockSettings.biometricEnabled}
                    onValueChange={onToggleBiometric}
                  />
                </>
              ) : null}
              <Divider />
              <Action
                Icon={Lock}
                title="এখনই লক করুন"
                subtitle="অ্যাপ এখনই লক করে দিন"
                onPress={onLockNow}
              />
            </>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          অ্যাকাউন্ট
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Pressable
            onPress={onCopyEmail}
            style={({ pressed }) => [
              styles.emailRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View
              style={[
                styles.emailIconWrap,
                { backgroundColor: colors.cardElevated },
              ]}
            >
              <Mail size={18} color={colors.accent} />
            </View>
            <View style={styles.emailMid}>
              <Text style={[styles.emailLabel, { color: colors.mutedForeground }]}>
                সাইন-ইন ইমেইল
              </Text>
              <Text style={[styles.emailValue, { color: colors.text }]}>
                {email}
              </Text>
            </View>
            <Copy size={16} color={colors.mutedForeground} />
          </Pressable>
          <Divider />
          <Action
            Icon={LogOut}
            title="অন্য ইমেইল ব্যবহার করুন"
            subtitle="ক্লাউড ডেটা একই ইমেইল দিয়ে আবার দেখা যাবে"
            onPress={onSignOut}
            tone="destructive"
          />
        </View>

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          একই ইমেইলে যেকোনো ফোন থেকে লগইন করলে একই ডেটা দেখতে পাবেন। যেকোনো একটি
          ফোনে ডেটা পরিবর্তন করলে সব ফোনেই আপডেট হবে।
        </Text>
      </ScrollView>
      <PinSetupSheet
        visible={pinSheet.visible}
        mode={pinSheet.mode}
        onClose={() => setPinSheet((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
}

function ToggleRow({
  Icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.actionRow}>
      <View
        style={[
          styles.actionIconWrap,
          { backgroundColor: colors.cardElevated },
        ]}
      >
        <Icon size={18} color={colors.accent} />
      </View>
      <View style={styles.actionMid}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.actionSubtitle, { color: colors.mutedForeground }]}
        >
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={Platform.OS === "android" ? colors.card : undefined}
      />
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

function Action({
  Icon,
  title,
  subtitle,
  onPress,
  busy,
  tone,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  busy?: boolean;
  tone?: "warn" | "destructive";
}) {
  const colors = useColors();
  const iconColor =
    tone === "destructive"
      ? colors.destructive
      : tone === "warn"
        ? colors.accent
        : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.actionRow,
        { opacity: pressed || busy ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.actionIconWrap,
          { backgroundColor: colors.cardElevated },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <Icon size={18} color={iconColor} />
        )}
      </View>
      <View style={styles.actionMid}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.actionSubtitle, { color: colors.mutedForeground }]}
        >
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  brand: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  logo: { width: 72, height: 72 },
  brandTitle: { fontSize: 24, fontWeight: "700" },
  brandTag: { fontSize: 13 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionMid: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: "600" },
  actionSubtitle: { fontSize: 12, marginTop: 2 },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  emailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emailMid: { flex: 1 },
  emailLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  emailValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  note: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    paddingHorizontal: 8,
    textAlign: "center",
  },
});

```

---

**শেষ — মোট 0 টি ফাইলের কোড এই ডকুমেন্টে আছে।**
