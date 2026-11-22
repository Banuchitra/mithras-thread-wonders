# U5–U8 · Accounts, admin console (form + AI), user management, cart

Status: **APPROVED by Banu, 2026-11-22** ("build it now"; login decisions below)
Requested: "editable form UI + AI helper, admins mithras.canada@gmail.com and banu_c@yahoo.com, user management,
sign-up / guest / cart for bulk orders — a standard website." Budget stays **$0**.

## Architecture (free tiers only)
```
 Browser (static site on GitHub Pages)
   ├─ public pages + cart (guest: saved in the browser)
   └─ /admin (client-side app)
         │  Firebase Auth ID token (JWT) on every request
         ▼
 Cloudflare Worker  ── "BFF" API: /api/*  (verifies JWT, checks role, holds secrets)
   ├─ D1 (SQLite) via Drizzle ORM migrations: users, roles, carts, order_requests
   ├─ GitHub API: writes content/products/*.md + photos → existing workflow republishes the site
   └─ Gemini API (free tier): reads photos, drafts listings, chats
```
- **Firebase Authentication** — standard e-commerce login: **email + password** (email is the username; show/hide
  toggle; forgot-password; email verification on sign-up) and **Continue with Google**.
- **Guest checkout** is the default; customer accounts are optional (save cart across devices, "My requests").
- **Products stay in Git** (`content/`) so the public site stays static, fast and free. The Worker is the only writer.
- **People, roles, carts, orders live in D1** — they change often and are private (never in the public repo).
- Hexagonal: Worker ports `ProductStore` (GitHub adapter), `AiAssistant` (Gemini adapter), `UserStore`/`OrderStore`
  (D1 adapter). Later AWS swap = new adapters (Lambda, DynamoDB/Aurora, Bedrock).

## Roles
| Role | Can |
|---|---|
| **admin** | everything: products, categories, settings, users, orders |
| **editor** | products + categories (e.g. a helper) |
| **customer** | own cart, own order requests |
**Super admin: `banu_c@yahoo.com`** — set in Worker config (`SUPER_ADMIN_EMAIL`), not in the database: always
admin, cannot be demoted/disabled/deleted by anyone. Applies **only when the email is verified** (prevents someone
registering that address first). Other admins/editors are granted on the Users page; elevated roles also require a
verified email.

## Units
| Unit | Scope | Done when |
|---|---|---|
| **U5 Backend + auth** | Worker (Hono), D1 + Drizzle migrations, Firebase token verification, roles, seed admins, `/api/me` | admin signs in, `/api/me` returns role; non-admin rejected |
| **U6 Admin console** | `/admin`: products list, **form editor** (add/edit/hide, photo upload with in-browser resize, reorder photos), categories, collections, site settings (font), **Users page** (invite by email, change role, disable) | owner adds a product with the form and sees it live |
| **U7 AI assistant** | drop photos → AI drafts name/category/colours/description → asks only price/stock/sizes → chat edits → fills the **same form** → preview → Publish | owner adds a product by chat in < 3 min |
| **U8 Cart & accounts** | guest cart (no sign-up needed), bulk quantities, "Send order request" → saved in D1 + WhatsApp handoff; optional sign-in to save cart across devices + "My requests"; admin **Orders** page | guest and signed-in customer can each send a request; admin sees it |
| U9 Customer chatbot | catalogue-grounded chat on the public site (same Worker + Gemini) | later |

## Accounts Banu creates (all free; Claude guides, never sees passwords)
1. Firebase project (Authentication → Google + Email link; authorised domain `banuchitra.github.io`, `localhost`).
2. Cloudflare account (Workers + D1).
3. Google AI Studio API key (Gemini).
4. GitHub fine-grained token for this repo only (contents: read/write) → stored as a Worker secret.

## Risks
- Free-tier limits (Gemini per-project, Workers 10 ms CPU, Firebase email-link daily sends) — fine for a small shop;
  UI shows a friendly message on limit errors.
- Security: every API call verifies the JWT + role server-side; the static site holds no secrets.
- Personal data (customer names/phones in order requests) lives only in D1, never in Git.
