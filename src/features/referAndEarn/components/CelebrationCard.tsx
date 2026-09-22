import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GiftIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';

/**
 * Geometry from Figma node 2265:15648.
 *
 * Deliberately a card in the page flow rather than an overlay: the First
 * Referral frame has no scrim or sheet, it sits between Recent Referrals and
 * the FAQs row. Like the funnel card it is transparent with a #D8EFDE hairline,
 * so the page wash shows through.
 */
const PERK_ICON = 20;

const PERKS = [
  {
    icon: <GiftIcon width={PERK_ICON} height={PERK_ICON} />,
    amount: '₹50',
    title: ' referral bonus',
    detail: 'Once they activate, you’ll earn ₹50 as a referral bonus.',
  },
  {
    icon: <GiftIcon width={PERK_ICON} height={PERK_ICON} />,
    amount: '20%',
    title: ' brokerage sharing',
    detail: 'Earn 20% of the brokerage share when they trade.',
  },
];

export function CelebrationCard({ onLearnMore }: { onLearnMore?: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <View style={styles.intro}>
          <Text style={styles.title}>Your friend has registered! 🎉</Text>
          <Text style={styles.subtitle}>
            They just need to complete KYC and activate their account.
          </Text>
        </View>

        <View style={styles.perks}>
          {PERKS.map((perk) => (
            <View key={perk.amount} style={styles.perk}>
              <View style={styles.perkIcon}>{perk.icon}</View>
              <View style={styles.perkText}>
                <Text style={styles.perkTitle}>
                  <Text style={styles.perkAmount}>{perk.amount}</Text>
                  {perk.title}
                </Text>
                <Text style={styles.perkDetail}>{perk.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Tertiary link in the design, not a filled button. */}
      <Pressable onPress={onLearnMore} accessibilityRole="button" hitSlop={8} style={styles.action}>
        <Text style={styles.actionLabel}>Learn More</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#D8EFDE',
  },
  body: {
    gap: 20,
  },
  intro: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    lineHeight: 19.2,
    color: '#03140F',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 14.4,
    color: colors.body,
  },
  perks: {
    gap: spacing.lg,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  perkIcon: {
    paddingVertical: 2,
  },
  perkText: {
    flex: 1,
    gap: 5,
  },
  perkTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
  },
  // The amount alone is Bricolage SemiBold 18/21.6 — a character override on
  // the same Figma text node, which is why the title box measures 22 not 18.
  perkAmount: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    lineHeight: 21.6,
  },
  perkDetail: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 13.2,
    color: colors.body,
  },
  action: {
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.accentText,
  },
  actionLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.accentText,
  },
});
