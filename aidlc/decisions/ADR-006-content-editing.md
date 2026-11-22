# ADR-006 · Admin content editing through the API + a ContentStore port

Status: Accepted · 2026-11-22

## Context
Products, categories, collections, promotions and site settings are files in `content/` (the static site is built
from them). The admin console must edit them, with login/role checks, without exposing anything publicly.

## Decision
- The API (Worker) exposes `/api/content/*` and `/api/uploads`; it checks the session + role (editor/admin;
  settings: admin) and **validates every field** (`api/src/domain/content.ts`) before writing.
- Writing goes through a **ContentStore port**:
  - **Local development:** `BridgeContentStore` → `scripts/content-bridge.mjs` (127.0.0.1:8788, shared secret)
    writes `content/*.md` and `public/images/...`. The Next dev server shows changes on refresh.
  - **Production (later):** a GitHub adapter commits the same files; the existing workflow republishes the site.
- Photos are resized to WebP in the browser; the server accepts only image data URLs and chooses the file path.
- Staff with a temporary password can do nothing except change it (enforced server-side).

## Consequences
+ Same validation and permissions locally and in production; no secrets in the browser.
− Local editing needs three processes (site, API, bridge): `npm run dev:all`.
