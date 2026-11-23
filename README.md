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

## Learning topics

This site was built to learn the topics below, hands-on. Status:
✅ applied in this repo · 🟡 partly, or local only · ⏳ later (AWS phase, with the DVA-C02 course) · ➖ not used here.

### 1. Login and access
| Topic | Status | Where / how |
|---|---|---|
| OAuth | 🟡 | Pages CMS signs in with a GitHub OAuth app; the live admin uses a GitHub fine-grained token (not OAuth) |
| JWT | ✅ | Own HS256 session tokens with token versioning (revoked on password change) — `api/src/adapters/sessions.ts` |
| Cognito | ⏳ | Compared in [ADR-004](aidlc/decisions/ADR-004-auth-and-backend.md); in-house auth chosen for $0 ([ADR-005](aidlc/decisions/ADR-005-in-house-auth.md)) |
| Password security | ✅ | PBKDF2 hashing, lockout after 5 attempts, one-time reset links — `api/src/domain/passwords.ts`, `api/src/app.ts` |

### 2. Secrets and network safety
| Topic | Status | Where / how |
|---|---|---|
| Secrets: build time vs runtime | ✅ | **Build time:** GitHub Actions secrets `ADMIN_PASSWORD` / `ADMIN_GITHUB_TOKEN` used only during deploy (`scripts/seal-admin-key.ts`). **Runtime:** Worker secrets `SESSION_SECRET` in `api/.dev.vars` (git-ignored) |
| Encryption | ✅ | Admin key published only as PBKDF2 + AES-256-GCM ciphertext — `src/lib/admin-crypto.ts` |
| AWS Secrets Manager | ⏳ | Same pattern, AWS service later |
| CORS / same-origin | ✅ | API origin allow-list; dev proxy `/api` → local API (`next.config.ts`) |
| VPC | ⏳ | Not needed for a static site; AWS phase |

### 3. Event-driven backend
| Topic | Status | Where / how |
|---|---|---|
| Serverless functions | 🟡 | Cloudflare Worker API (`api/`) — runs locally, not deployed |
| Lambda | ⏳ | The Worker's ports/adapters are designed to move to Lambda |
| SQS, EventBridge, Step Functions | ⏳ | Planned for Amazon SP-API sync — growth path in [`aidlc/02-design.md`](aidlc/02-design.md) |

### 4. Data and infrastructure
| Topic | Status | Where / how |
|---|---|---|
| Database + provisioning | 🟡 | Cloudflare D1 (SQLite) provisioned locally with wrangler; object storage R2 for private photos |
| Drizzle ORM migrations | ✅ | Schema `api/src/adapters/schema.ts` → migrations in `api/migrations/` |
| Aurora PostgreSQL | ⏳ | AWS phase (D1 used for $0) |
| Infra footprint | ✅ | GitHub Pages + GitHub Actions only — $0; no servers in production |
| Content as data | ✅ | Products, categories, offers, settings as files in `content/`; money stored in minor units ([ADR-002](aidlc/decisions/ADR-002-money-minor-units.md)) |

### 5. Frontend and web delivery
| Topic | Status | Where / how |
|---|---|---|
| React | ✅ | React 19 components (`src/components/`) |
| Next.js | ✅ | App Router, static export, dynamic routes, metadata, rewrites — `src/app/`, `next.config.ts` |
| Server Actions | ➖ | Not possible with a static export (no server) |
| Vite | 🟡 | Vitest runs on Vite; the site itself uses Next.js |
| Tailwind | ✅ | Tailwind CSS 4 theme tokens from the monogram — `src/app/globals.css` |
| CDN / CloudFront | 🟡 | GitHub Pages CDN; CloudFront in the AWS phase |
| Node | ✅ | Build scripts, imports, image processing (sharp), local helpers — `scripts/` |
| Koa | ➖ | Hono used instead (same middleware idea, runs on Workers) |
| BFF (Backend for Frontend) | ✅ | Worker API shapes data for the site; dev proxy so the browser talks to one origin |
| Mobile / Safari | ✅ | Tested in WebKit at iPhone sizes (Playwright); JPEG fallback where WebP isn't supported |

### 6. Observability and architecture
| Topic | Status | Where / how |
|---|---|---|
| Hexagonal architecture | ✅ | Ports: `CatalogSource`, `Store`, `ContentStore`, `InquiryStore`, `PhotoStore`; adapters for Markdown, D1, R2, GitHub, local bridge |
| Domain-Driven Design | ✅ | Pure domain modules in `src/domain/` and `api/src/domain/` (products, money, categories, promotions, access rules) |
| AIDLC governance | ✅ | Intent → requirements → design → units → ADRs in [`aidlc/`](aidlc/); one branch + PR per unit |
| Testing / TDD | ✅ | Tests written first for domain logic — `tests/unit/`, `api/test/`; CI on every pull request |
| CloudWatch, Pino logs | ⏳ | AWS phase |

### Agentic workflow (Claude Code 101 / Claude Code in Action)
| Practice | Status | Where |
|---|---|---|
| CLAUDE.md project rules | ✅ | [`CLAUDE.md`](CLAUDE.md) |
| Plan mode → build → review → PR | ✅ | Every unit; plans in [`aidlc/units/`](aidlc/units/) |
| Custom commands | ✅ | `.claude/commands/` — `/aidlc-inception`, `/new-unit`, `/unit-review`, `/learn-note` |
| Subagents | ✅ | `.claude/agents/` — `reviewer`, `a11y-auditor`, `content-checker` |
| Hooks | ⏳ | Planned (auto lint/typecheck after edits) — not added yet |

### Learning hub
`npx serve learning` opens local study pages with diagrams, links and quizzes. Done: **AIDLC**, **Agentic workflow**.
Remaining topic pages (Next.js, Tailwind, hexagonal/DDD, testing & CI, OAuth/JWT, GitHub Pages, AWS roadmap) are
listed on the hub's home page.

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
