# Mithra's Thread Wonders — project rules for Claude

Handmade-jewellery portfolio site for Mithra's Thread Wonders (Banu's cousin, non-technical owner; Amazon.ca seller "MITHRAS CANADA"). Also a learning project:
Banu is learning AIDLC, the Claude Code agentic workflow, and web fundamentals.

## Hard constraints
- **$0 budget.** No paid services, no trials that convert to paid. Ask before adding any external service.
- **No AWS for now.** Keep `src/domain` free of framework/vendor imports so an AWS adapter can be added later.
- Hosting: GitHub Pages (static export). No server runtime in production.
- Prices are **CAD** today, stored as `{ amount: <minor units, e.g. 3500>, currency: 'CAD' }` and formatted with `Intl.NumberFormat`. Never assume one currency in domain code — export to other countries is planned.
- **Amazon Seller SKU is the canonical product ID.** Copy it exactly from Seller Central; never rename or normalise it. URLs use a separate `slug`.
- **Product wording is the owner's.** Titles, bullets and descriptions come verbatim from her Amazon listings — don't rewrite them.
- Owner = the **maker in India**. Retail stock is held in Canada (Banu ships locally). **Only public contact: WhatsApp +91 80156 18956 and Instagram @mithras_thread_wonders.** Never publish Banu's name/address/phone, invoices or cost prices (public repo; `pdf/` is gitignored).
- Two audiences: **retail** (in-stock pieces, CAD) and **wholesale** (custom colours/sizes, bulk quote via WhatsApp quote builder).
- Collections/categories are **owner-managed data** (Pages CMS), never hard-coded.
- v1 is a **portfolio**: browse designs, then contact via Amazon link / Instagram DM / WhatsApp. No cart, no stock. Build data and ports so a full shop with an Amazon backend can be added later.
- **Never crop product photos.** Show the whole piece: render product images inside arch frames only via
  `src/components/ArchImage.tsx` (object-contain + safe padding); never `object-cover` on a product photo.
- **Brand, UI design and colours are Banu's decisions.** Propose options; never pick them silently.

## Stack (decided — see aidlc/decisions/)
Next.js (App Router, `output: 'export'`) · TypeScript · Tailwind · Vitest · Playwright · Pages CMS · GitHub Actions.
v2: in-browser chatbot (WebLLM), lazy-loaded.

## AIDLC process (lightweight)
- Inception → Construction → Operations. Artifacts live in `aidlc/`.
- Don't start a unit without an approved `aidlc/units/Ux.md`.
- One unit = one branch (`unit/Ux-short-name`) = one PR.
- Record non-obvious choices as `aidlc/decisions/ADR-NNN-title.md` (context, decision, consequences).

## Working rules
- Write tests first for domain logic and adapters.
- Before opening a PR: run the `reviewer` and `a11y-auditor` subagents, fix findings, then `/code-review`.
- After merging a unit: `/learn-note` updates the matching page in `learning/`.
- After adding/removing an npm package, regenerate the lock from scratch (`rm -rf node_modules package-lock.json && npm install`):
  npm on macOS drops Linux-only optional entries (sharp/@emnapi), which makes `npm ci` fail in GitHub Actions.
- Never commit secrets. Never push to `main` directly once CI exists.
- Keep the owner's editing path (Pages CMS) working. If `content/` schema changes, update `.pages.yml` too.

## Layout
- `learning/` — local learning hub (plain HTML/CSS/JS, not deployed). Run: `npx serve learning`.
- `aidlc/` — intent, requirements, design, unit plans, ADRs.
- `content/products/` — product markdown (edited via Pages CMS).
- `src/domain` (pure TS) · `src/adapters` (content loading) · `src/app` (Next.js routes).

## Local backend (api/)
- In-house accounts API (Cloudflare Worker + local D1). First time: `cd api && npm run setup:local`; run: `cd api && npm run dev` (port 8787). Tests: `cd api && npm test`.
- Super admin = `SUPER_ADMIN_EMAIL` in `api/wrangler.toml`; never make it editable data. `SESSION_SECRET` lives in `api/.dev.vars` (gitignored).
