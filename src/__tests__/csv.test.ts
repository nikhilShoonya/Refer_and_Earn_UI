import { CsvColumn, UTF8_BOM, datedFileName, toCsv } from '../utils/csv';

interface Row {
  name: string;
  amount: number;
}

const columns: CsvColumn<Row>[] = [
  { header: 'Name', value: (r) => r.name },
  { header: 'Amount', value: (r) => r.amount },
];

describe('toCsv', () => {
  it('writes a header row followed by one line per record', () => {
    const csv = toCsv(columns, [
      { name: 'Akshay Thakur', amount: 2460 },
      { name: 'Harsh Arora', amount: 840 },
    ]);
    const lines = csv.replace(UTF8_BOM, '').split('\r\n');

    expect(lines[0]).toBe('Name,Amount');
    expect(lines[1]).toBe('Akshay Thakur,2460');
    expect(lines[2]).toBe('Harsh Arora,840');
  });

  it('leads with a BOM so Excel reads it as UTF-8', () => {
    // Without this Excel mangles ₹ and any non-ASCII name.
    expect(toCsv(columns, [])).toMatch(/^﻿/);
  });

  it('quotes fields containing a comma so columns do not shift', () => {
    const csv = toCsv(columns, [{ name: 'Thakur, Akshay', amount: 10 }]);
    expect(csv).toContain('"Thakur, Akshay",10');
  });

  it('doubles embedded quotes', () => {
    const csv = toCsv(columns, [{ name: 'Akshay "AT" Thakur', amount: 10 }]);
    expect(csv).toContain('"Akshay ""AT"" Thakur",10');
  });

  it('quotes fields containing newlines', () => {
    const csv = toCsv(columns, [{ name: 'line1\nline2', amount: 10 }]);
    expect(csv).toContain('"line1\nline2",10');
  });

  it('renders null and undefined as empty cells', () => {
    const sparse: CsvColumn<{ a: null; b: undefined }>[] = [
      { header: 'A', value: (r) => r.a },
      { header: 'B', value: (r) => r.b },
    ];
    const csv = toCsv(sparse, [{ a: null, b: undefined }]);
    expect(csv.replace(UTF8_BOM, '').split('\r\n')[1]).toBe(',');
  });

  it('emits only a header when there are no rows', () => {
    expect(toCsv(columns, []).replace(UTF8_BOM, '')).toBe('Name,Amount');
  });
});

describe('datedFileName', () => {
  it('stamps the date so repeat exports do not collide', () => {
    expect(datedFileName('my-referrals', new Date(2026, 8, 17))).toBe(
      'my-referrals-2026-09-17.csv',
    );
  });

  it('zero-pads single-digit months and days', () => {
    expect(datedFileName('report', new Date(2026, 0, 5))).toBe('report-2026-01-05.csv');
  });
});
