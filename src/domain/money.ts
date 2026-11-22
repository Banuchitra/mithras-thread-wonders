import type { Money } from './types';

const MINOR_UNITS: Record<string, number> = { JPY: 0 };
const digits = (currency: string) => MINOR_UNITS[currency] ?? 2;

// 'en' shows an unambiguous symbol (CA$35.00) — international visitors can't confuse it with US$.
export function formatMoney(money: Money, locale = 'en'): string {
  const d = digits(money.currency);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(money.amount / 10 ** d);
}

/** "29.49" → { amount: 2949 }. Rounds to the currency's minor unit to avoid float drift. */
export function moneyFromDecimal(value: string | number, currency: string): Money {
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid price: ${value}`);
  return { amount: Math.round(n * 10 ** digits(currency)), currency };
}
