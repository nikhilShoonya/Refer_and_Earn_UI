import { ReferralStatus } from '../features/referAndEarn/api/types';

/** ₹6,200 — Indian digit grouping, no decimals, matching the Figma labels. */
export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "16 Aug, 2026" — the join-date format used on referral rows. */
export function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

/** "7 Sep 2026" — settlement dates. */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "16 Aug, 2026 10:35AM" — journey timeline stamps. */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hours = d.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${formatJoinDate(iso)} ${display}:${String(d.getMinutes()).padStart(2, '0')}${suffix}`;
}

export const STATUS_LABEL: Record<ReferralStatus, string> = {
  registered: 'Registered',
  kyc_completed: 'KYC Completed',
  activated: 'Activated',
  pending: 'Pending',
};

/** Two-letter monogram used by the row avatars, e.g. "Akshay Thakur" -> "AT". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Stable per-name tint so a given referral keeps the same avatar colour. */
export function tintIndex(name: string, buckets: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100000;
  }
  return hash % buckets;
}
