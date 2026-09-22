import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppHeader } from '../../../components/AppHeader';
import { DisclosureRow, SectionHeader } from '../../../components/primitives';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { DESIGN_WIDTH, colors, radii, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';
import { useReferralClient, useReferralScenario } from '../api/ReferralProvider';
import { Referral } from '../api/types';
import { useAsync } from '../api/useAsync';
import { CelebrationCard } from '../components/CelebrationCard';
import { ContributorsCard } from '../components/ContributorsCard';
import { EarningsCard } from '../components/EarningsCard';
import { FunnelCard } from '../components/FunnelCard';
import { ReferralFooter } from '../components/ReferralFooter';
import { ReferralRow } from '../components/ReferralRow';
import { ValuePropsCard } from '../components/ValuePropsCard';
import { QrSheet } from '../sheets/QrSheet';
import { ReferralJourneySheet } from '../sheets/ReferralJourneySheet';

const HERO = require('../../../../assets/figma/images/hero-refer.png');
/** Intrinsic size of the exported illustration frame (Figma 324x220). */
const HERO_RATIO = 324 / 220;

interface Props {
  /**
   * Leaves the feature. The hub is the root of this stack, so there is nothing
   * to pop — a host app passes the route back to its own home.
   */
  onBack?: () => void;
  onOpenFaqs: () => void;
  onOpenHowItWorks: () => void;
  onOpenMyReferrals: () => void;
  onOpenBrokerage: () => void;
}

/**
 * The Refer & Earn hub. The same screen renders all three lifecycle states the
 * design covers — Day 0 (empty), first referral, and the populated Day 1 — with
 * the active scenario coming from the injected client.
 */
export function ReferEarnHomeScreen({
  onBack,
  onOpenFaqs,
  onOpenHowItWorks,
  onOpenMyReferrals,
  onOpenBrokerage,
}: Props) {
  const client = useReferralClient();
  const scenario = useReferralScenario();
  const { width } = useWindowDimensions();

  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: summary } = useAsync(() => client.getEarningsSummary(), [client]);
  const { data: funnel } = useAsync(() => client.getFunnel('current_month'), [client]);
  const { data: contributors } = useAsync(() => client.getTopContributors(), [client]);
  const { data: referrals } = useAsync(() => client.getReferrals(), [client]);
  const { data: code } = useAsync(() => client.getReferralCode(), [client]);

  const isDay0 = scenario === 'day0';
  // Render the page as a unit. Gating each block individually meant the
  // blocks with no async dependency — the FAQs row, the celebration card —
  // painted first and the rest dropped in behind them.
  const ready =
    isDay0 || (summary !== null && funnel !== null && contributors !== null && referrals !== null);
  const isFirstReferral = scenario === 'firstReferral';

  const heroWidth = Math.min(width, DESIGN_WIDTH) - spacing.gutter * 2 - 34;

  const openJourney = useCallback((referral: Referral) => setJourneyId(referral.id), []);

  return (
    <ScreenBackground
      overlay={
        <>
          <ReferralJourneySheet
            visible={journeyId !== null}
            referralId={journeyId}
            onClose={() => setJourneyId(null)}
          />
          <QrSheet visible={qrOpen} onClose={() => setQrOpen(false)} />
        </>
      }
    >
      {/* Figma's Day 0 frame carries no nav title — the dark badge in the
          content is the wordmark. The populated states title the bar. All
          three carry the back arrow at the left and the help mark at the
          right. */}
      <AppHeader
        title={isDay0 ? '' : 'Refer & Earn'}
        onBack={onBack}
        onHelp={onOpenHowItWorks}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="refer-earn-scroll"
      >
        {!ready ? null : isDay0 ? (
          <View style={styles.day0}>
            {/* Figma nests three auto-layouts here: intro (gap 16) wrapping
                the badge and the headline pair (gap 4), then the outer column
                spacing intro / hero / card at 8. */}
            <View style={styles.intro}>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Refer &amp; Earn</Text>
              </View>
              <View style={styles.headlineBlock}>
                <Text style={styles.headlineTop}>Invite friends/family to</Text>
                <Text style={styles.headline}>start earning for life</Text>
              </View>
            </View>

            <Image
              source={HERO}
              style={[styles.hero, { width: heroWidth, height: heroWidth / HERO_RATIO }]}
              resizeMode="contain"
              accessibilityLabel="Two phones exchanging a gift box of coins"
            />

            <ValuePropsCard />
          </View>
        ) : (
          <>
            {summary ? <EarningsCard summary={summary} compact={isFirstReferral} /> : null}
            {funnel ? <FunnelCard counts={funnel} showPeriod={!isFirstReferral} /> : null}
            {contributors && contributors.length > 0 ? (
              <ContributorsCard contributors={contributors} onViewDetail={onOpenBrokerage} />
            ) : null}

            {referrals && referrals.length > 0 ? (
              <View style={styles.recent}>
                <SectionHeader
                  title="Recent Referrals"
                  actionLabel="View All"
                  onAction={onOpenMyReferrals}
                />
                <View style={styles.recentList}>
                  {referrals.slice(0, 3).map((referral) => (
                    <ReferralRow
                      key={referral.id}
                      referral={referral}
                      onViewJourney={openJourney}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/*
              Gated on the same data as the sections above it. Without this it
              is the only block with no async dependency, so it paints alone
              on first render and the rest of the page pops in afterwards.
            */}
            {isFirstReferral ? <CelebrationCard onLearnMore={onOpenHowItWorks} /> : null}
          </>
        )}

        {ready ? <DisclosureRow label="FAQs" onPress={onOpenFaqs} /> : null}
      </ScrollView>

      <ReferralFooter code={code} onShowQr={() => setQrOpen(true)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  // Outer Day 0 column: Figma frame 1707486282 spaces intro / hero / card
  // at 8, not the 16 used for everything before.
  day0: { alignItems: 'center', gap: spacing.sm },
  intro: { alignItems: 'center', gap: spacing.lg, alignSelf: 'stretch' },
  headlineBlock: { alignItems: 'center', gap: spacing.xs, alignSelf: 'stretch' },
  // Node 2265:14196: fill #206C58, radius 4, padding 4/8. The earlier 16pt
  // side padding came from eyeballing a render; the node itself says 8, and
  // the pill measures 114 because the label is Bricolage 16, not Figtree 14.
  badge: {
    backgroundColor: colors.inkDisplay,
    borderRadius: radii.sm / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeLabel: { ...typography.displaySm, lineHeight: 19.2, color: colors.surfaceGreenTint },
  // Figma stacks the two lines with a +4 gap and contrasting weights:
  // 24/400 over 32/600. This previously used a -4 margin and one weight.
  headlineTop: { ...typography.displayLgLight, textAlign: 'center' },
  headline: { ...typography.displayLg, textAlign: 'center' },
  // The exported artwork carries transparent padding — its ink fills only
  // 90.5% x 81.8% of the 972x660 frame — so laying it out on its frame box
  // puts ~24pt of dead space above the illustration and ~16pt below, on top
  // of whatever gap the column adds. Figma spaces the *ink*, so pull the
  // frame back in by the difference rather than shrink the image, which
  // would render it smaller than the design.
  hero: { marginVertical: -9 },
  // Figma frame 1707486171 spaces the header and list at 16.
  // Figma: section spaces header -> list at 16 (frame 1707486171),
  // the list spaces its cards at 12 (frame 1707486174).
  recent: { gap: spacing.lg },
  recentList: { gap: spacing.md },
});
