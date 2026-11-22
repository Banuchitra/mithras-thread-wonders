import type { Sku } from './types';

export interface QuoteContact {
  name: string;
  business?: string;
  country: string;
}

export interface QuoteLine {
  item: string;
  quantity: number;
  notes: string;
  likeSku?: Sku;
}

/** Formats a wholesale request as a numbered list, like the owner's order sheet. Nothing is stored. */
export function formatQuoteMessage(contact: QuoteContact, lines: QuoteLine[]): string {
  const items = lines.filter((l) => l.item.trim() && l.quantity > 0);
  if (items.length === 0) throw new Error('Add at least one item with a quantity');
  const body = items.map((l, i) => {
    const like = l.likeSku ? ` [like ${l.likeSku}]` : '';
    const notes = l.notes.trim() ? ` (${l.notes.trim()})` : '';
    return `${i + 1}. ${l.item.trim()} × ${l.quantity}${notes}${like}`;
  });
  const who = [contact.name.trim(), contact.business?.trim(), contact.country.trim()].filter(Boolean).join(' · ');
  return ['Hi! Wholesale quote request', `From: ${who}`, '', ...body, '', 'Please share pricing and delivery time. Thank you!'].join('\n');
}
