/**
 * CSV serialisation for the export buttons.
 *
 * Kept deliberately small and dependency-free: the exports are a few hundred
 * rows of plain data, so a spreadsheet-compatible escaper is all that is
 * needed.
 */

export interface CsvColumn<T> {
  header: string;
  /** Returned value is stringified and escaped; return '' for blanks. */
  value: (row: T) => string | number | null | undefined;
}

/**
 * RFC 4180 escaping. A field is quoted when it contains a comma, a quote or a
 * line break, and embedded quotes are doubled. Without this, a referral name
 * containing a comma would silently shift every later column.
 */
function escapeField(raw: string | number | null | undefined): string {
  const value = raw === null || raw === undefined ? '' : String(raw);
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Excel on Windows decides the encoding from a byte-order mark. Without one it
 * reads the file as the system codepage and mangles every non-ASCII
 * character — "₹2,460" being the obvious casualty here.
 */
export const UTF8_BOM = '﻿';

export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const lines = [
    columns.map((c) => escapeField(c.header)).join(','),
    ...rows.map((row) => columns.map((c) => escapeField(c.value(row))).join(',')),
  ];
  // CRLF is what spreadsheet software expects for a .csv.
  return UTF8_BOM + lines.join('\r\n');
}

/** `my-referrals-2026-09-17.csv` — dated so repeated exports do not collide. */
export function datedFileName(base: string, now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `${base}-${stamp}.csv`;
}
