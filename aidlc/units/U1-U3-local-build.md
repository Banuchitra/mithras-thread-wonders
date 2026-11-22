# U1–U3 · First local build (combined at Banu's request: "start construction and launch on localhost")

Status: **In progress** · 2026-11-22

## Done
- Next.js 16 (static export) + React 19 + Tailwind 4 + TypeScript 5.9; Vitest.
- Domain (`src/domain`): Product, Money (minor units), Sku, Collection/Category, channels (Amazon/Instagram/WhatsApp
  links), wholesale quote formatter — **14 unit tests, written first**.
- Adapter `src/adapters/markdown-catalog.ts` (content price "35.00" → Money); composition root `src/lib/catalog.ts`.
- `scripts/import-amazon-intake.ts`: 11 products imported verbatim; photos → WebP (≤ ~200 KB).
- Content: 5 collections, 24 categories (owner's poster), site settings incl. **font pairing** (admin-selectable).
- Pages: home, shop, collection, category (empty → custom-order prompt), product (gallery, actions, schema.org),
  wholesale (quote builder → WhatsApp), about, 404. 46 static pages build.
- `.pages.yml` drafted (settings incl. Font style, collections, categories, products).

## Remaining before PR
- ESLint + PostToolUse lint/typecheck hook; Playwright e2e; GitHub Actions CI + Pages deploy (U1).
- Verify `.pages.yml` in Pages CMS (reference fields, image lists); make `specs` editable as a list (U5).
- Run `reviewer` + `a11y-auditor` subagents; Lighthouse.
