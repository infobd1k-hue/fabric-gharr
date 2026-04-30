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
- **Android APK build** (EAS): `artifacts/mobile/eas.json` configures `preview` (APK for sideloading) and `production` (AAB for Play Store) profiles. `app.json` has `android.package: com.fabricghar.app`, `versionCode: 1`, `INTERNET`/`USE_BIOMETRIC` permissions, and adaptive icon. `EXPO_PUBLIC_DOMAIN` must be set in `eas.json` env to the deployed API server URL (without `https://`) before building. Scripts: `pnpm --filter @workspace/mobile run apk` (cloud build, requires `eas-cli` + `eas login` + `eas init`). Full step-by-step Bengali guide: `exports/APK-BUILD-GUIDE.md`.

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
