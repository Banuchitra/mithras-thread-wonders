# U9–U11 · Owner editing on the live site — no server, no external services

Status: **U9 built** · approved by Banu 2026-11-23 (option A: one password via GitHub secrets)
Goal: the owner (non-technical) maintains the whole site herself, without asking for code changes.
Constraints: $0; GitHub Pages; **no servers, no external services, no AI**; one admin login.

## U9 · Admin login + saving on the live site
- Two GitHub Actions secrets: `ADMIN_PASSWORD` (strong, chosen by Banu) and `ADMIN_GITHUB_TOKEN`
  (fine-grained token: this repo only, Contents read/write).
- The deploy workflow encrypts the token with the password (PBKDF2-SHA256 600k + AES-GCM) and publishes only the
  encrypted blob. The browser unlocks it when the admin types the password; saves are GitHub commits → the existing
  workflow republishes (~1 min). Nothing secret is in the repository.
- Admin console (products, categories, menu, website, promotions) switches from the local API to a
  **GitHub ContentStore adapter** in the browser — same screens, same validation.
- Customer accounts, cart and server-stored requests are hidden on the live site (custom orders via WhatsApp).
  The local API stays for learning / a future backend.
- **All customer-visible text moves into content** (hero, section titles, About, Wholesale steps, footer…).
- **Menu editor:** categories already drive the Shop menu and ☰ menu (add/rename/reorder/hide/delete);
  new editable **menu links** (label, link, show in top bar / ☰ menu / both, order).

## U10 · "Edit this page" mode
- Signed in → **Edit this page**: dotted outlines on every editable text, photo and link; tap to change;
  **Save** (one commit) or **Discard**. Works on home, product, collection, About, Wholesale pages.

## U11 · Blocks + safety
- Home / About / Wholesale built from **blocks** she can add, remove and reorder: offer banner, video,
  product row (by category), text, photo + text, reviews, FAQ.
- **History & Undo** (from GitHub commits), required fields, automatic photo resizing, layouts that can't break.
- Guided buttons: Add product · Add offer · Replace photo · Hide · Undo.

## Done when
The owner, on her phone, signs in on the live site, adds a category and a menu link, edits the home headline in
place, adds a product with photos, and undoes a change — all live within ~1 minute, with no help.

## Risks
- Password strength protects the encrypted token (public blob) → Banu chooses a long passphrase.
- Token expiry (≤ 1 year) → admin shows a renewal reminder 30 days before.
- GitHub API rate limits are far above a small shop's needs.
