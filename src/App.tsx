/**
 * File: src/App.tsx
 *
 * Purpose:
 * Root application component for the public Spinalith.com website.
 *
 * Responsibilities:
 * - Hands control to the public website router.
 * - Keeps the root app shell intentionally thin.
 * - Prevents homepage/layout logic from accumulating in App.tsx.
 *
 * Notes:
 * - This is the public marketing/content site, not the Spinalith workspace app.
 * - Route definitions live in src/routes/PublicRouter.tsx.
 * - Shared site chrome lives in src/layouts/MarketingLayout.tsx.
 */

import { PublicRouter } from "./routes/PublicRouter";

export default function App() {
  return <PublicRouter />;
}