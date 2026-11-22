# ADR-003 · Portfolio now; ports for a shop with an Amazon backend later

Status: Proposed · 2026-11-22

## Context
v1 must be $0 and static (GitHub Pages). The owner wants a full shop later, with Amazon as backend.

## Decision
Hexagonal core: `src/domain` defines `CatalogSource` and `OrderChannel` ports. v1 adapters are a Markdown
catalog and link-builders for Amazon / Instagram DM / WhatsApp. Checkout, inventory and SP-API sync are
future adapters (see 02-design.md growth path).

## Consequences
+ Pages and domain don't change when the backend arrives. + Matches the learning roadmap (AWS later).
− Slightly more structure than a pure portfolio needs today.
