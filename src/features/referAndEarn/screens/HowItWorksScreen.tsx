import React from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../../../components/AppHeader';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { TrustShieldIcon } from '../../../icons';
import { colors, radii, shadows, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';
import { StepConnector } from '../components/StepConnector';
import { StepIllustration } from '../components/StepIllustration';
import { hiwIllustrations } from '../data/illustrations';

/**
 * Geometry transcribed from Figma node 2265:14909 ("How it Works").
 * Every number below is the value on the node, not an approximation.
 */
const HERO = {
  height: 192,
  padding: 16,
  /** Left text column; the illustration takes the remaining 160. */
  textWidth: 198,
  artSize: 160,
  gap: 16,
};

const STEP = {
  cardHeight: 104,
  cardPadding: 12,
  cardRadius: 12,
  cardGap: 32,
  iconSize: 80,
  iconRadius: 24,
  /** Text column beside the icon. */
  textWidth: 238,
  textGap: 8,
  /**
   * Dashed rail offsets within the step stack. Figma ends the rail 9pt short
   * of the last card rather than running it to the edge, which puts its top 3
   * below the stack rather than 32.
   */
  railTop: 3,
  railHeight: 396,
};

interface Step {
  badge: string;
  title: string;
  detail: string;
  art: ImageSourcePropType;
}

const STEPS: Step[] = [
  {
    badge: 'STEP 1',
    title: 'Share & Invite Friends',
    detail: 'Share your unique referral code or link to friends & family',
    art: hiwIllustrations.step1,
  },
  {
    badge: 'STEP 2',
    title: 'Friend Registers',
    detail: 'They sign up using your referral code on the Shoonya app',
    art: hiwIllustrations.step2,
  },
  {
    badge: 'STEP 3',
    title: 'Complete KYC & Activates',
    detail: 'Friend completes their profile and make their first trade',
    art: hiwIllustrations.step3,
  },
  {
    badge: 'STEP 4',
    title: 'Earn ₹50 + 20% Brokerage',
    detail: 'Get ₹50 bonus on activation & Earn 20% brokerage on trades!',
    art: hiwIllustrations.step4,
  },
];

function StepCard({ step, highlighted }: { step: Step; highlighted: boolean }) {
  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted]}>
      <StepIllustration source={step.art} size={STEP.iconSize} radius={STEP.iconRadius} />

      <View style={styles.cardText}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{step.badge}</Text>
        </View>
        <View>
          <Text style={[styles.stepTitle, highlighted && styles.stepTitleHighlighted]}>
            {step.title}
          </Text>
          <Text style={[styles.stepDetail, highlighted && styles.stepDetailHighlighted]}>
            {step.detail}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * "How it Works?" — a full-bleed green hero with the stacked
 * "Your Network / Your Earnings" headline and the four-step explainer.
 *
 * Note this screen carries no sticky referral footer: the Figma frame does not
 * have one.
 */
export function HowItWorksScreen({ onBack }: { onBack?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <AppHeader
        title="How it Works?"
        onBack={onBack}
        horizontalPadding={spacing.xl}
        reserveAction
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-bleed: the hero spans the frame edge to edge, not the gutter. */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <View style={styles.heroCopy}>
              <View style={styles.heroHeadlines}>
                <Text style={styles.headline}>Your Network</Text>
                <Text style={styles.headline}>Your Earnings</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                Invite your friends to Shoonya and earn while they trade.
              </Text>
            </View>

            <View style={styles.trustPill}>
              <TrustShieldIcon width={16} height={16} />
              <Text style={styles.trustLabel}>
                Trusted by <Text style={styles.trustEmphasis}>10 Lakh+</Text> traders
              </Text>
            </View>
          </View>

          <Image
            source={hiwIllustrations.network}
            style={styles.heroArt}
            resizeMode="contain"
          />
        </View>

        <View style={styles.steps}>
          <StepConnector top={STEP.railTop} height={STEP.railHeight} />
          {STEPS.map((step, index) => (
            <StepCard key={step.badge} step={step} highlighted={index === STEPS.length - 1} />
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  // Figma budgets the strip below the last card as the home-indicator zone,
  // so the bottom padding is the safe-area inset rather than a fixed value.
  content: {},

  // --- Hero -------------------------------------------------------------
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HERO.height,
    padding: HERO.padding,
    backgroundColor: '#E0FAE7',
  },
  // Figma fills this column (the art takes a fixed 160), so it widens with the
  // frame rather than leaving slack at 393.
  heroText: {
    flex: 1,
    gap: HERO.gap,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  heroHeadlines: {
    gap: spacing.xs,
  },
  headline: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    lineHeight: 28.8,
    color: '#000000',
  },
  heroSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 14.4,
    color: colors.body,
  },
  // Figma fills the column with this pill and outlines it; the 1pt border is
  // what takes it from 24 to the 26 on the node.
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#D8EFDE',
    backgroundColor: colors.surface,
  },
  trustLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: colors.ink,
  },
  trustEmphasis: {
    fontFamily: fontFamily.semibold,
    color: '#33A346',
  },

  heroArt: {
    width: HERO.artSize,
    height: HERO.artSize,
  },

  // --- Steps ------------------------------------------------------------
  steps: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.gutter,
    gap: STEP.cardGap,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    height: STEP.cardHeight,
    padding: STEP.cardPadding,
    borderRadius: STEP.cardRadius,
    backgroundColor: colors.surface,
  },
  // Figma gives only the final card a shadow; cards 1-3 have no fx at all.
  cardHighlighted: {
    backgroundColor: colors.ink,
    ...shadows.card,
  },
  cardText: {
    width: STEP.textWidth,
    gap: STEP.textGap,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    backgroundColor: '#206C58',
  },
  badgeLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: colors.surface,
  },
  stepTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
  },
  stepTitleHighlighted: {
    color: colors.funnelTile,
  },
  stepDetail: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },
  stepDetailHighlighted: {
    color: colors.surfaceGreenTint,
  },
});
