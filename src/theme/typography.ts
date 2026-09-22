import { TextStyle } from 'react-native';

import { colors } from './tokens';

/**
 * The Figma file uses Figtree for UI and Bricolage Grotesque for display
 * headings. Each entry below mirrors a (family, weight, size, lineHeight)
 * combination that actually appears on the "Ready to Dev" page.
 */
export const fontFamily = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  /** Headline line 1 is Bricolage 400 in Figma, not the 600 used elsewhere. */
  displayRegular: 'BricolageGrotesque_400Regular',
  display: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
} as const;

type Variant =
  | 'displayXl'
  | 'displayLg'
  | 'displayLgLight'
  | 'displayMd'
  | 'displaySm'
  | 'sectionTitle'
  | 'titleMd'
  | 'titleSm'
  | 'bodyMd'
  | 'bodySm'
  | 'label'
  | 'labelStrong'
  | 'caption'
  | 'captionStrong'
  | 'micro'
  | 'legal';

export const typography: Record<Variant, TextStyle> = {
  /** Day 0 value-prop numerals — Bricolage 600 / 36. */
  displayXl: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 43, color: colors.inkDisplay },
  /** Hero headline second line — Bricolage 600 / 32 (Figma 2265:14196). */
  displayLg: { fontFamily: fontFamily.display, fontSize: 32, lineHeight: 38.4, color: colors.ink },
  /** Hero headline first line — Bricolage 400 / 24, a lighter weight than displayLg. */
  displayLgLight: { fontFamily: fontFamily.displayRegular, fontSize: 24, lineHeight: 28.8, color: colors.ink },
  /** Total earnings figure — Bricolage 700 / 24. */
  displayMd: { fontFamily: fontFamily.displayBold, fontSize: 24, lineHeight: 28.8, color: colors.ink },
  /** Card headings — Bricolage 600 / 16. */
  displaySm: { fontFamily: fontFamily.display, fontSize: 16, lineHeight: 19.2, color: colors.ink },
  /** Section headings on Brokerage / My Referrals. */
  sectionTitle: { fontFamily: fontFamily.display, fontSize: 18, lineHeight: 21.6, color: colors.ink },

  titleMd: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 20, color: colors.ink },
  titleSm: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 18, color: colors.ink },

  bodyMd: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 18, color: colors.body },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 14.4, color: colors.body },

  label: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 20, color: colors.body },
  labelStrong: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 16, color: colors.ink },

  caption: { fontFamily: fontFamily.medium, fontSize: 11, lineHeight: 16, color: colors.subtle },
  captionStrong: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 14, color: colors.ink },

  micro: { fontFamily: fontFamily.semibold, fontSize: 10, lineHeight: 12, color: colors.body },
  legal: { fontFamily: fontFamily.medium, fontSize: 8, lineHeight: 10, color: colors.subtle },
};
