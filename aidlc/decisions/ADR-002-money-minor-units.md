# ADR-002 · Money stored in minor units with an explicit currency

Status: Proposed · 2026-11-22

## Context
Prices are CAD today; export to other countries is planned. Floating-point prices cause rounding bugs.

## Decision
Store `price: { amount: 3500, currency: "CAD" }` (integer cents). Format only at the edge with
`Intl.NumberFormat(locale, { style: 'currency', currency })`. Domain code never hard-codes a currency.

## Consequences
+ Adding markets = adding data. + No float rounding. − Owner enters "35.00" in the CMS; the import/CMS
  layer converts to cents.
