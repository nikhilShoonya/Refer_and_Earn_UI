import {
  formatCurrency,
  formatJoinDate,
  formatShortDate,
  formatTimestamp,
  initialsOf,
  tintIndex,
} from '../utils/format';

describe('formatCurrency', () => {
  it('uses Indian digit grouping with no decimals', () => {
    expect(formatCurrency(6200)).toBe('₹6,200');
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('groups lakhs the Indian way rather than in thousands', () => {
    expect(formatCurrency(100000)).toBe('₹1,00,000');
  });
});

describe('date formatting', () => {
  it('renders join dates as they appear on referral rows', () => {
    expect(formatJoinDate('2026-08-16')).toBe('16 Aug, 2026');
  });

  it('renders settlement dates without zero padding', () => {
    expect(formatShortDate('2026-09-07')).toBe('7 Sep 2026');
  });

  it('renders journey timestamps with a 12-hour clock', () => {
    expect(formatTimestamp('2026-08-16T10:35:00')).toBe('16 Aug, 2026 10:35AM');
  });

  it('maps midnight to 12AM rather than 0AM', () => {
    expect(formatTimestamp('2026-08-16T00:05:00')).toBe('16 Aug, 2026 12:05AM');
  });

  it('passes through unparseable input untouched', () => {
    expect(formatJoinDate('not-a-date')).toBe('not-a-date');
  });
});

describe('initialsOf', () => {
  it('takes first and last initials', () => {
    expect(initialsOf('Akshay Thakur')).toBe('AT');
  });

  it('falls back to the first two letters for a single name', () => {
    expect(initialsOf('Prakash')).toBe('PR');
  });

  it('ignores repeated whitespace', () => {
    expect(initialsOf('  Harsh   Arora ')).toBe('HA');
  });
});

describe('tintIndex', () => {
  it('is stable for the same name', () => {
    expect(tintIndex('Sachin Kumar', 5)).toBe(tintIndex('Sachin Kumar', 5));
  });

  it('stays inside the bucket range', () => {
    for (const name of ['A', 'Emily Clark', 'Zack Thompson', '']) {
      const idx = tintIndex(name, 5);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(5);
    }
  });
});
