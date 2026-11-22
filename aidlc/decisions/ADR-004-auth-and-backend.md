# ADR-004 · Firebase Auth + Cloudflare Worker (BFF) + D1 for accounts, admin and orders

Status: Accepted · 2026-11-22

## Context
The site is static (GitHub Pages, $0). The owner needs an admin console (form + AI), user management and customer
carts/order requests. Requirements: standard e-commerce login (email+password, Google), a permanent super admin,
$0, no AWS yet.

## Decision
- **Firebase Authentication** issues ID tokens (JWT) for email/password and Google sign-in.
- **Cloudflare Worker** is the only backend (a BFF): verifies the JWT (Google JWKS, issuer/audience = project id),
  checks role, holds secrets (GitHub token, Gemini key). Framework: Hono.
- **D1 (SQLite) + Drizzle ORM** for users/roles now; carts and order requests in a later migration.
- Products stay in Git; the Worker commits content changes, the existing workflow republishes.
- Super admin email is configuration (`SUPER_ADMIN_EMAIL`), enforced in domain code, requires a verified email.

## Consequences
+ $0 on free tiers; static site stays fast. + Hands-on OAuth/JWT, serverless, migrations, BFF, hexagonal ports.
− Three new free accounts (Firebase, Cloudflare, Google AI Studio). − Not AWS: later swap = new adapters
  (Lambda, DynamoDB/Aurora, Cognito) behind the same ports.
