# ADR-005 · In-house email + password login (supersedes the Firebase part of ADR-004)

Status: Accepted · 2026-11-22 — Banu: "build an in-house login module without any external integration".

## Decision
- The Worker API owns accounts: **email + password**, sign-up (admin can switch it off), sign-in, sign-out,
  change password, forgot/reset password.
- **Passwords**: PBKDF2-SHA256 (WebCrypto), per-user random salt, iterations stored in the hash string
  (default 100,000 — the Cloudflare Workers maximum). Never stored or logged in plain text.
- **Sessions**: our own signed JWT (HS256, `SESSION_SECRET`), 7 days. A per-user `tokenVersion` is bumped on
  password change/reset or disable, which invalidates old sessions.
- **Brute force**: 5 failed sign-ins → account locked 15 minutes.
- **Reset without email**: "Forgot password" creates a request visible to admins; an admin generates a one-time
  link (24 h, stored hashed) and sends it to the person (e.g. WhatsApp). Email delivery can be added later.
- **Super admin** `banu_c@yahoo.com` from config; cannot be demoted, disabled or removed. With no email
  verification, both admin accounts are **pre-created** so nobody else can register those addresses.
- **Seed admins** get temporary passwords — `mithras.canada@gmail.com` / `admin1234` (default admin, Banu's
  request) and `banu_c@yahoo.com` / `admin` and **must change it at first sign-in**. Seeding is a deliberate script, not a migration, so a
  deployed database never silently starts with a known password.

## Consequences
+ No external services; works fully on localhost. + Hands-on: hashing, JWT, sessions, lockout, RBAC.
− Accounts live only in the local D1 database until the API is deployed (Cloudflare).
− PBKDF2 at 100k iterations may exceed the Workers *free* plan's 10 ms CPU per request — measure at deploy
  time; options: tune iterations (stored per hash, so changeable) or a different deployment target.
