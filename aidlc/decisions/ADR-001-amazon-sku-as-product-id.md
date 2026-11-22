# ADR-001 · Amazon Seller SKU is the canonical product ID

Status: Proposed · 2026-11-22

## Context
The owner already lists every product on Amazon.ca with a Seller SKU (e.g. `PERUMAL-001A`). The site will later
sync with Amazon (SP-API), which identifies a seller's products by SKU. Two existing SKUs are irregular
(`JADAU LOTUS-001` has a space; `Lakshmi-001A` is mixed case).

## Decision
- `sku` is copied exactly from Seller Central and never changed or normalised in our data.
- URLs use a separate, fixed `slug`.
- Recommended convention for new SKUs: `DESIGN-NNNV` — uppercase, no spaces; `NNN` = design number,
  `V` = variant letter (A, B, …). e.g. `PEACOCK-002A` (new design), `PEACOCK-001B` (colour variant).

## Consequences
+ 1:1 match with Amazon for future sync; no mapping table.
+ Irregular SKUs work because URLs never contain them.
− SKUs must be unique; the content-checker subagent validates this.
