# 00 · Intent — Mithra's Thread Wonders website

Status: **APPROVED by Banu, 2026-11-22** ("start construction")
Date: 2026-11-22

## Problem
Mithra's Thread Wonders ("Where Thread Meets Fashion") is a maker of handcrafted jewellery and accessories in
Tamil Nadu, India — bangles, kundan accessories, chains & anklets, artificial flowers, kids accessories.
Retail stock is held in Canada and sold via Amazon.ca and direct orders; wholesale buyers anywhere can order
custom designs in bulk. There is no brand-owned place to see the whole collection, trust the brand, and reach
the maker directly (WhatsApp +91 80156 18956, Instagram @mithras_thread_wonders).

## Who it is for
| Person | Need |
|---|---|
| **Retail customer** (Canada) | Browse designs on phone, see photos and CAD prices, then buy on Amazon or order via WhatsApp/Instagram |
| **Wholesale buyer** (any country) | See the range, ask for custom colours/sizes, get a quote for bulk orders |
| **Owner** (non-technical) | Add/update products without code; look professional |
| **Banu** (builder) | Learn AIDLC, agentic workflow and modern web while building something real |

## v1 — Portfolio (this release)
A professional catalogue: brand home, product grid, product detail, about, contact.
Every product offers: **Buy on Amazon** (if listed) · **Message on Instagram** · **Order on WhatsApp**, plus
**Request a custom/bulk quote**. A wholesale page has a quote builder that sends the request via WhatsApp.
No cart, no payments, no stock tracking.

## Future — full shop (not in v1, but designed for)
Cart and checkout on the site, inventory and orders synchronised with Amazon (Seller Central / SP-API),
multiple currencies and countries. v1 data and code structure must make this an *addition*, not a rewrite.

## Success criteria
1. All 11 current products live with the owner's exact Amazon wording, photos and CAD prices.
2. Each product's Amazon / Instagram / WhatsApp actions and the wholesale quote builder work on mobile and desktop.
3. Owner can add a product through Pages CMS and see it live without help.
4. Lighthouse ≥ 90 for performance, accessibility, SEO on the home and product pages.
5. **$0** running cost.

## Constraints
- $0; GitHub Pages static hosting; no AWS for now.
- Product wording is the owner's (verbatim from Amazon).
- Public repo: no invoices, cost prices, or Banu's personal details.
- Amazon Seller SKU is the permanent product ID.
- Brand, design and colours are Banu's decisions.
