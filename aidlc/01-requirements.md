# 01 · Requirements — v1 Portfolio

Status: **APPROVED by Banu, 2026-11-22** ("start construction")

## Business context
- **Mithra's Thread Wonders** — the owner (Banu's cousin) is the **maker**, based in Tamil Nadu, India.
- **Retail stock in Canada**: pieces shipped from India to Canada; Banu holds them and ships within Canada
  when the owner receives an order. Banu's name/address/phone never appear on the site.
- **Wholesale / custom**: buyers (any country) choose designs, colours and sizes and request a **quote for bulk
  orders**, made to order in India. ("All colours and sizes can be customized.")
- **Only contact**: the owner's WhatsApp **+91 80156 18956** and Instagram @mithras_thread_wonders.

## User stories

### Browse (retail)
- **US-1** Home page shows the brand (logo, name, tagline), collections and featured designs.
  - AC: logo + "Where Thread Meets Fashion" visible above the fold on a 375px phone.
- **US-2** Product grid with photo, title, price, availability badge.
  - AC: price shown as `CA$35.00` (from `{amount: 3500, currency: "CAD"}`); badge "Ships within Canada" or "Made to order".
- **US-3** Browse by **collection → category** (e.g. Chains & Anklets → Invisible chains).
  - AC: menu and filters are built from the owner's category list; filter state is in the URL.
- **US-4** Product page with all photos, the owner's bullets, description and key specs.
  - AC: text matches the Amazon listing exactly; images swipeable on mobile.

### Act — retail
- **US-5** **Buy on Amazon** (only when the product has an Amazon listing) → Amazon.ca `/dp/<ASIN>` in a new tab.
- **US-6** **Message on Instagram** → `https://ig.me/m/mithras_thread_wonders`.
- **US-7** **Order on WhatsApp** → `https://wa.me/918015618956?text=…` prefilled:
  *"Hi! I'd like to order Perumal Temple Jewelry Pearl Bead Necklace Set (SKU PERUMAL-001A) — CA$35.00. <page link>"*

### Act — wholesale / custom
- **US-8** **Wholesale & custom orders** page explains: any design in any colour/size, bulk pricing on request,
  made in India, ships internationally.
- **US-9** **Quote request builder**: buyer adds lines (category, quantity, design notes/colour/size; optionally
  "like SKU X"), plus name, country and business name → one tap opens WhatsApp with a neatly formatted list
  (like the owner's "Order 1" sheet). No server needed.
  - AC: works on mobile; message under WhatsApp's URL length limit; nothing stored.
- **US-10** Every product page has **"Want this in other colours or in bulk? Request a quote"** → builder prefilled with that SKU.

### About
- **US-11** About page: the maker's story ("Where Thread Meets Fashion"), handmade in India; contact via WhatsApp/Instagram.

### Owner (admin, Pages CMS)
- **US-12** Owner adds/edits products (fields, photos) and sees them live within ~5 minutes.
- **US-13** Owner **creates, renames, reorders and hides collections and categories** herself; products pick
  a category from a dropdown; site menus/filters update automatically.
- **US-14** Owner hides a product without deleting it (`status: hidden`).

## Catalogue structure (owner-editable; starting set from "Our Collections")
| Collection | Categories |
|---|---|
| Bangles | Bridal bangles · Silk thread bangles · Return gift bangles · Glass bangles · Kids bangles |
| Kundan Accessories | Banana clips · Center clips · Catcher clips · Hairbands · Saree pins · Finger rings · Jada billa / Hair hooks |
| Chains & Anklets | Invisible chains & anklets · Korean chains & anklets |
| Artificial Flowers | Flower strings · Kemp flower pendant clips · Antique flower pendant clips · Flower center clips · Kids flower alligator clips · Flower bunches |
| Kids Accessories | Tiktok clips · Headbands · Brooch pins · Alligator clips |

Current 11 products (per the owner's invoices):
| SKU | Category |
|---|---|
| LEAF-001A, CHAKRA-001A, Lakshmi-001A, SNOWFLAKES-001A, JADAU LOTUS-001, KERALA-001A, FLWR-BTRFLY-001A | Invisible chains & anklets |
| PERUMAL-001A, RABBIT-001A, PEACOCK-001A, LOTUS-SET-001A | Korean chains & anklets |

Other stock in Canada (bangles, saree pins, brooches, clips, flowers) has no Amazon listing yet — the owner
adds those via the CMS with photos (no Amazon button for them).

## Product data (per product)
| Field | Example | Source |
|---|---|---|
| `sku` (ID, never changes) | `PERUMAL-001A` | Seller Central, exact |
| `slug` (URL) | `perumal-temple-pearl-bead-necklace-set` | generated once, then fixed |
| `title`, `subtitle` | Amazon full title (before / after `\|`) | verbatim |
| `bullets[]`, `description`, `specs` | Amazon listing | verbatim |
| `price` | `{ amount: 3500, currency: "CAD" }` | Seller Central |
| `category` | reference to an owner-defined category | owner |
| `availability` | `ships-from-canada` · `made-to-order` | owner |
| `images[]` | ordered, first = main | listing photos / owner uploads |
| `listings[]` | `{ channel: amazon, marketplace: ca, asin: B0HNPBWRK6 }` | Amazon |
| `customisable` | `true` (default) | owner |
| `status` | `active` · `hidden` | owner |

## Brand & design (decided)
- Name **Mithra's Thread Wonders**; tagline **"Where Thread Meets Fashion"**; logo `logo.jpeg`.
- **Option 1** colours — logo gradient accents on a clean white page (`design/preview.html`).
  Text/buttons: violet `#6A2C91`, blue `#2D5BD3`, magenta `#D81B78`, dark teal `#0E7C6B`, ink `#1F1A2E`.
  Gold `#D4A73A`, green `#3DBB5A`, teal `#14A08C`: decoration only.
- Listing text shown verbatim, including "MITHRAS CANADA" wording inside it.
- **Style: traditional Indian** (Banu, 2026-11-22): deep plum `#2E1245` bands with a faint gold lotus motif, gold
  ornamental dividers, arch-shaped photo frames, centred serif section titles, softly rounded buttons. **No cursive.**
- Fonts: serif headings + plain body; owner picks in admin (Heritage = Cormorant Garamond + Lato [default],
  Temple = Marcellus + Mulish, Royal = Playfair Display + Source Sans). Gold text on light uses `#8A6A12`.

## Non-functional
- $0 hosting (GitHub Pages, public repo) → **no private data in the repo** (invoices, costs, Banu's details).
- Mobile-first; WCAG 2.2 AA; `prefers-reduced-motion` respected; browsing works without JavaScript.
- SEO: per-product metadata, Open Graph image, sitemap, schema.org `Product` with CAD offers.
- Images resized to ≤ 200 KB at build.
- English now; text/currency kept out of components for future languages/markets.

## Out of scope for v1
Cart, checkout, payments, stock counts, accounts, multiple currencies/languages, chatbot (v2), AWS.

## Proposed units
| Unit | Scope |
|---|---|
| U1 | Next.js + Tailwind scaffold, static export to GitHub Pages, Vitest/Playwright, CI, lint hook |
| U2 | Domain model (Product, Category, Money, Sku, listings, availability) + content adapter + import of 11 products — TDD |
| U3 | Catalogue UI: home, collections/categories, grid + filters, product page, about, brand styling, animations |
| U4 | Contact: Amazon / Instagram / WhatsApp buttons, wholesale page + quote builder; SEO |
| U5 | Pages CMS: products + owner-managed collections/categories; owner how-to guide |
| U6 | Polish: a11y audit, Lighthouse budget in CI, launch |
| v2 | In-browser chatbot; later: AWS + Amazon SP-API shop (see 02-design.md) |
