# Mithra's Thread Wonders

*Where Thread Meets Fashion* — the website of a handmade-jewellery maker in Tamil Nadu, India: chains,
silk thread and bridal bangles, kundan accessories, artificial flowers and kids' accessories.
In-stock pieces ship within Canada; custom and wholesale orders ship worldwide.

**Live site:** https://banuchitra.github.io/mithras-thread-wonders/

It is also a learning project, built step by step with the **AIDLC** process (AI-Driven Development Lifecycle)
and a **Claude Code** agentic workflow. Running cost: **$0**.

---

## What the site does

**For customers**
- Browse 30+ designs by collection and category (Shop menu and ☰ side menu are built from the category list).
- Product pages with swipeable photos, a full-screen photo viewer, prices in CAD, an optional video,
  and **Order on WhatsApp**, **Buy on Amazon.ca** and **Message on Instagram** buttons.
- Home page "What's New": rotating offers banner, video panel linked to a product, featured designs.
- **Wholesale & custom orders** form — the request opens in WhatsApp, ready to send.
- **Shopping Assistant** (bottom-right) — finds designs by colour, type or price, e.g. "green bangles under $30".

**For the shop owner (admin)**
- Sign in with **one admin password** (person icon → Admin sign in) → straight to the **dashboard**.
- Add, edit, hide or delete products (photos from the phone, price, description, video, Amazon link).
- Add, rename, reorder or hide collections and categories — the menus update automatically.
- Change the offers banner, video panel, announcement bar, contact details, fonts and About text.
- **Admin Assistant** (gold, bottom-right) — plain instructions such as "hide peacock necklace",
  "price of lakshmi necklace to 31.99", "announcement: Diwali sale", "add category Anklets to Chains & Necklaces".
  Every change is shown first and only runs after **Yes, do it**.
- Saved changes go live in about a minute.

---

## How it works

```
Browser ── static site on GitHub Pages (Next.js export) ── content/*.md, public/images/*
   │
   └─ admin signs in with the password
        → unlocks the GitHub key in the browser (key is published only in encrypted form)
        → saves = commits to this repo → GitHub Actions rebuilds and republishes (~1 min)
```

- **No server and no database on the live site.** Products, categories, offers and settings are files in
  `content/`; photos are in `public/images/`.
- **Admin login without a server:** two GitHub Actions secrets — `ADMIN_PASSWORD` and `ADMIN_GITHUB_TOKEN`
  (fine-grained token, this repo only, Contents read/write). The deploy workflow encrypts the token with the
  password (PBKDF2-SHA256, 600k iterations + AES-256-GCM) into `admin-key.json`. See `scripts/seal-admin-key.ts`.
- **Hexagonal / DDD:** pure domain code in `src/domain` (products, money in minor units, categories,
  promotions, assistants); adapters for where content lives (Markdown files, GitHub API, local API).
- `api/` is a Cloudflare Worker (Hono + D1 + Drizzle) used **for local development and learning**:
  accounts, roles, custom-order requests with private photos. It is not deployed.

| Area | Technology |
|---|---|
| Website | Next.js 16 (static export), React 19, TypeScript, Tailwind CSS 4 |
| Hosting / CI | GitHub Pages, GitHub Actions |
| Admin saving (live) | GitHub REST API from the browser, WebCrypto |
| Local API | Cloudflare Workers (wrangler), Hono, D1 (SQLite), Drizzle ORM, R2 |
| Tests | Vitest (web + API); Playwright (WebKit/iPhone) and Puppeteer for browser checks |

---

## Run it locally

Requirements: Node 24, npm.

```bash
npm install
(cd api && npm install && npm run setup:local)   # first time: local database + local admin account
npm run dev:all                                   # website :3000, API :8787, content helper :8788
```

- Website: http://localhost:3000 — on a phone on the same Wi-Fi, use the address `dev:all` prints.
- Admin: http://localhost:3000/account/ — the local admin password is set by `api/scripts/seed-local.mjs`.
  (The live site uses the `ADMIN_PASSWORD` secret instead.)
- Locally, admin changes are written to the `content/` and `public/images/` files on your computer.

Other commands:

```bash
npm test                 # website unit tests
(cd api && npm test)     # API tests
npm run typecheck
npm run build            # static export to out/
npx serve learning       # local learning hub (AIDLC, agentic workflow notes)
```

---

## Deploying

Every push to `main` runs **.github/workflows/deploy.yml**: typecheck → tests → static build →
seal the admin key → publish to GitHub Pages. Pull requests run the same checks without publishing.

Work happens on branches (`unit/…`) with one pull request per unit of work.

### Admin password and key
- **Change the password:** update the `ADMIN_PASSWORD` secret (Settings → Secrets and variables → Actions),
  then re-run the latest deploy. Use a long passphrase (16+ characters, not related to the shop name).
- **Renew the key** (fine-grained tokens expire, at most yearly): create a new token for this repo with
  Contents read/write, update `ADMIN_GITHUB_TOKEN`, re-run the deploy.

---

## Project layout

```
src/app/            pages (home, shop, products, wholesale, about, account, admin/*)
src/components/     UI: header, menus, gallery, assistants, admin shell…
src/domain/         pure business rules (no framework) + tests in tests/unit
src/lib/            content client (local API or GitHub), crypto, paths
content/            products, categories, collections, promotions, site settings
public/images/      product, promotion and site photos
api/                local Worker API (accounts, requests) — not deployed
scripts/            imports, admin-key sealing, local dev helpers
aidlc/              intent, requirements, design, ADRs, unit plans
learning/           local learning hub (HTML)
```

## AIDLC artifacts

- Inception: [`aidlc/00-intent.md`](aidlc/00-intent.md), [`aidlc/01-requirements.md`](aidlc/01-requirements.md)
- Design: [`aidlc/02-design.md`](aidlc/02-design.md) and decisions in [`aidlc/decisions/`](aidlc/decisions/)
- Units of work: [`aidlc/units/`](aidlc/units/)
- Rules for Claude Code: [`CLAUDE.md`](CLAUDE.md)

## Privacy

Invoices and other business documents (`pdf/`), raw photo downloads (`products-intake/_*`), local databases and
secrets are git-ignored. The repository is public: never commit passwords, tokens or personal details.

## Contact

WhatsApp +91 80156 18956 · Instagram [@mithras_thread_wonders](https://www.instagram.com/mithras_thread_wonders/)
