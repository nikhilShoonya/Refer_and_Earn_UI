/**
 * Design tokens read directly off the Figma file
 * "Refer & Earn (Copy)" -> page "Ready to Dev" (4:92).
 *
 * Values here are the literal fills / radii / spacing found on the nodes, so
 * this file is the single place to reconcile if the design changes.
 */

export const colors = {
  /** Screen background wash (Background instance base fill). */
  canvas: '#F3FFF7',
  /** Flat surface behind scrolling content on populated screens. */
  canvasFlat: '#FAFAFA',
  /** Top blurred band of the background. */
  washTop: '#B2FEC7',
  washBottom: '#ECFFF0',

  surface: '#FFFFFF',
  /** Inset tiles inside a card (earnings split, referral code box). */
  surfaceMuted: '#F6F6F6',
  /** Tinted circle behind small earnings icons. */
  surfaceGreenTint: '#EEFFF2',
  /** Funnel step icon tile. */
  funnelTile: '#6CE890',
  /** Divider pill behind the "+" between value props. */
  tintSoftGreen: '#D8EFDE',

  /** Primary dark green — headings, hero numerals. */
  ink: '#082F25',
  /** Display green used for the ₹50 / 20% numerals on Day 0. */
  inkDisplay: '#206C58',
  /** Default body copy. */
  body: '#424242',
  /** Secondary copy. */
  muted: '#5D5D5D',
  /** Tertiary copy — Paid/Pending labels. */
  subtle: '#6D6D6D',

  /** Amber CTA + link colour. */
  accent: '#EFA145',
  /** Amber used for inline links and the period switcher. */
  accentText: '#C67C2C',

  /** Paid amounts. */
  positive: '#04824C',
  /** Pending amounts and error text. */
  warning: '#F15A25',

  /** Value-props card outline (Figma 2265:14196). */
  borderGreen: '#D8EFDE',
  /** Referral-code box outline in the sticky footer. */
  borderCode: '#E6F0ED',
  /** QR thumbnail outline — a pale amber, not the full accent. */
  borderQr: '#FEE1BA',
  /** Near-black used for the FAQs row label. */
  inkDeep: '#03140F',
  border: '#DADADA',
  borderSoft: '#EAEAEA',
  indicator: '#D1D1D1',

  /** Status pill palette (My Referrals / Recent Referrals rows). */
  statusRegisteredBg: '#F1F1F1',
  statusRegisteredText: '#424242',
  statusKycBg: '#FFF4E4',
  statusKycText: '#C67C2C',
  statusActivatedBg: '#E7F9EC',
  statusActivatedText: '#04824C',

  /** Avatar tints, cycled by index. */
  avatarTints: ['#F1F1F1', '#D9F2E1', '#E3ECFB', '#FCEEDD', '#EDE6FA'],
  avatarInk: ['#424242', '#04824C', '#3A6FD8', '#C67C2C', '#6B4BC4'],
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 100,
} as const;

export const spacing = {
  /** Horizontal screen gutter — content is 358 wide inside a 390 frame. */
  gutter: 16,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Target screen width. The Figma frames were drawn at 390 (iPhone 14/15);
 * the app targets iPhone 16 at 393. Layout is fluid, so the 3pt difference
 * just widens the gutters slightly.
 */
export const DESIGN_WIDTH = 393;

/**
 * The sticky footer's fixed content: 24 top padding + a 48 code row + a 16
 * gap + a 48 CTA row. Its bottom padding tracks the safe area on top of this.
 */
export const FOOTER_CONTENT_HEIGHT = 136;

/** Bottom padding of the sticky footer, and of anything aligning to it. */
export function footerBottomPadding(insetBottom: number): number {
  return (insetBottom || spacing.sm) + spacing.sm;
}

/**
 * Total footer height. The export toast sits 16 above this (Figma 2265:13743
 * puts it 16 over a 185pt footer), so it has to be derived rather than fixed —
 * the footer grows with the device's safe area.
 */
export function footerHeight(insetBottom: number): number {
  return FOOTER_CONTENT_HEIGHT + footerBottomPadding(insetBottom);
}

export const shadows = {
  card: {
    boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  },
  /** 48x48 value-prop icon tiles on Day 0. */
  tile: {
    boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  },
  raised: {
    boxShadow: '0px 6px 16px rgba(10, 45, 34, 0.1)',
  },
} as const;
