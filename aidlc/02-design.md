# 02 · Design — built as a portfolio, shaped like a shop

Status: **APPROVED by Banu, 2026-11-22** ("start construction")

## Principle
v1 is a static portfolio, but the **domain model and ports are those of a real shop**. Growth means adding
adapters, not rewriting pages or data. (Hexagonal architecture + a small DDD core.)

```
                ┌──────────────── src/domain (pure TypeScript, no framework) ────────────────┐
                │  Product · Sku · Money · Collection/Category · Availability · SalesChannel  │
 UI (Next.js) ─▶│  ports:  CatalogSource      OrderChannel        (later) Checkout, Inventory │
                └──────────────┬──────────────────────┬───────────────────────────────────────┘
                               │                      │
        v1 adapters:  MarkdownCatalog         AmazonLink / InstagramDM / WhatsApp / QuoteRequest
                      (content/*)             (build URLs only; quote → formatted WhatsApp text)
        later:        AmazonSpApiCatalog      SiteCheckout (+ payment provider)
                      (sync via AWS Lambda)   AmazonMcfFulfilment / inventory sync
```

## Domain model
```ts
type Sku = string & { readonly __brand: 'Sku' };         // exact Seller Central SKU
type Money = { amount: number; currency: string };        // minor units: 3500 = CA$35.00
type ChannelListing =
  | { channel: 'amazon'; marketplace: 'ca' | 'us' | 'uk' | string; asin: string }
  | { channel: 'instagram'; handle: string }
  | { channel: 'whatsapp'; phone: string };

interface Product {
  sku: Sku;
  slug: string;
  title: string; subtitle?: string;
  bullets: string[]; description: string;
  price: Money;                       // one price today; later Money per market
  categoryId: string;                 // owner-defined Category (see below)
  availability: 'ships-from-canada' | 'made-to-order';
  customisable: boolean;
  images: { src: string; alt: string }[];
  specs: Record<string, string>;
  listings: ChannelListing[];
  status: 'active' | 'hidden';
}
```
Why this scales:
- **SKU as ID** = the same key Amazon's SP-API uses (`sellerSku`), so a future sync can match products 1:1.
- **Money with currency** = adding USD/GBP/EUR later is data, not code. `Intl.NumberFormat` handles display.
- **Listings array** = one product can have Amazon.ca, Amazon.com, Amazon.co.uk entries when she exports.
- **slug separate from SKU** = clean, translatable URLs; the SKU never appears in a URL that must change.

Owner-managed taxonomy:
```ts
interface Collection { id: string; name: string; order: number; image?: string; hidden?: boolean }
interface Category   { id: string; name: string; collectionId: string; order: number; hidden?: boolean }
interface QuoteLine  { categoryId?: string; likeSku?: Sku; quantity: number; notes: string }  // never stored
```

## Content storage (v1)
- `content/products/<slug>.md` — YAML frontmatter (fields above); edited by Pages CMS.
- `content/collections/<id>.md`, `content/categories/<id>.md` — created/ordered/hidden by the owner in Pages CMS;
  products reference a category by id (CMS dropdown).
- `public/images/products/<slug>/<n>.webp` — resized at import/build.
- `scripts/import-amazon-intake.ts` — one-off: `products-intake/*/source.json` → content files (verbatim text).

## Growth path (later phases, mapped to the learning roadmap)
| Stage | What changes | New adapters / services | Learning topics |
|---|---|---|---|
| v1 portfolio | — | Markdown catalog, link channels | Next.js, Tailwind, DDD, hexagonal |
| v2 | Chatbot | WebLLM in browser | in-browser AI |
| v3 international | Prices + listings per market, i18n routes | `Money` per market, locale routing | i18n |
| v4 shop | Cart + checkout, orders | Checkout API (AWS Lambda + API Gateway), payment provider, DynamoDB orders | Lambda, API GW, DynamoDB, Cognito, Secrets/SSM |
| v5 Amazon backend | Catalog/price/inventory from Amazon; Amazon fulfils site orders | SP-API sync (EventBridge schedule → Lambda → SQS), Multi-Channel Fulfilment | EventBridge, SQS, Step Functions, CloudWatch |

Note: v4+ have running costs (payment fees, possibly AWS beyond free tier). Decide at that time.

## Decisions
- ADR-001 Amazon SKU is the canonical product ID
- ADR-002 Money stored in minor units with currency; CAD today
- ADR-003 Portfolio now, ports for shop + Amazon backend later
