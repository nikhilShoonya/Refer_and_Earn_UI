import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

import { Scrim } from '../../../components/Scrim';
import { JourneyCurrentIcon, JourneyDoneIcon, JourneyPendingIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';
import { formatTimestamp } from '../../../utils/format';
import { useReferralClient } from '../api/ReferralProvider';
import { useAsync } from '../api/useAsync';
import { Avatar } from '../components/ReferralRow';

/**
 * Geometry from Figma node 2265:14764 ("Referral Journey").
 *
 * Not built on `BottomSheet`, for the same reason as the other two overlays:
 * the design insets the drawer by 24 rather than running full-bleed, and opens
 * with its own tinted header card carrying the grabber.
 *
 * Figma draws the done node at 42x42/r12, the current one at 40x40/r8 and the
 * remaining two at 42x40/r12. That is a slip in the file rather than three
 * deliberate sizes, so all four are normalised to 42x42/r12 here.
 */
const SHEET = {
  gutter: 24,
  radius: 16,
  padX: 24,
  grabberWidth: 80,
  grabberHeight: 4,
  /** 8 above the grabber + 4 + 20 = the 32pt top padding Figma gives the card. */
  grabberGap: 20,
  node: 42,
  /** Every connector is a fixed 61 regardless of how the label wraps. */
  connector: 61,
  railGap: 18,
};

const RAIL_COLOR = '#D1D1D1';
const RAIL_DASH = '4 4';

interface Props {
  visible: boolean;
  referralId: string | null;
  onClose: () => void;
}

/**
 * Per-referral timeline: Registered -> KYC Completed -> Account Activated ->
 * Referral Bonus Credited, with a Remind action while stages are outstanding.
 */
export function ReferralJourneySheet({ visible, referralId, onClose }: Props) {
  const client = useReferralClient();
  const insets = useSafeAreaInsets();
  const { data, loading } = useAsync(
    () => (referralId ? client.getReferralJourney(referralId) : Promise.resolve(null)),
    [referralId, client],
  );

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  // The first step still outstanding is the one the referral is sitting on:
  // Figma marks it with a ring and a dot rather than an empty circle.
  const currentIndex = data ? data.steps.findIndex((s) => s.completedAt === null) : -1;

  return (
    <View style={styles.root}>
      <Scrim onPress={onClose} accessibilityLabel="Close" />

      <View style={[styles.drawer, { paddingBottom: insets.bottom || spacing.lg }]}>
        {loading || !data ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.grabber} />

              <View style={styles.headerRow}>
                <View style={styles.identityRow}>
                  <Avatar name={data.name} backgroundColor={colors.surface} />
                  <View style={styles.identity}>
                    <Text style={styles.name} numberOfLines={1}>
                      {data.name}
                    </Text>
                    <Text style={styles.phone}>{data.maskedPhone}</Text>
                  </View>
                </View>

                {data.canRemind ? (
                  <Pressable
                    style={styles.remind}
                    accessibilityRole="button"
                    onPress={() => client.remindReferral(data.referralId)}
                  >
                    <Text style={styles.remindLabel}>Remind</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.timeline}>
              {data.steps.map((step, index) => {
                const done = step.completedAt !== null;
                const current = index === currentIndex;
                const last = index === data.steps.length - 1;
                const Glyph = done
                  ? JourneyDoneIcon
                  : current
                    ? JourneyCurrentIcon
                    : JourneyPendingIcon;

                return (
                  <View key={step.key} style={styles.step}>
                    <View style={styles.rail}>
                      <View style={[styles.node, done && styles.nodeDone]}>
                        <Glyph width={20} height={20} />
                      </View>
                      {/* Solid as far as progress has reached, dashed beyond. */}
                      {!last ? (
                        <Svg width={1} height={SHEET.connector}>
                          <Line
                            x1={0.5}
                            y1={0}
                            x2={0.5}
                            y2={SHEET.connector}
                            stroke={RAIL_COLOR}
                            strokeWidth={1}
                            strokeDasharray={done ? undefined : RAIL_DASH}
                          />
                        </Svg>
                      ) : null}
                    </View>

                    <View style={styles.stepText}>
                      <Text style={styles.stepTitle}>{step.label}</Text>
                      <Text style={styles.stamp}>
                        {done ? formatTimestamp(step.completedAt as string) : 'Pending'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  drawer: {
    zIndex: 1,
    marginHorizontal: SHEET.gutter,
    borderTopLeftRadius: SHEET.radius,
    borderTopRightRadius: SHEET.radius,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  loading: { paddingVertical: spacing.xxl, alignItems: 'center' },

  // --- Tinted header card ------------------------------------------------
  header: {
    backgroundColor: '#F2F7F4',
    paddingTop: spacing.sm,
    paddingHorizontal: SHEET.padX,
    paddingBottom: spacing.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: SHEET.grabberWidth,
    height: SHEET.grabberHeight,
    borderRadius: SHEET.grabberHeight / 2,
    backgroundColor: '#B0B0B0',
    marginBottom: SHEET.grabberGap,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  identityRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.body,
  },
  phone: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },
  remind: {
    width: 100,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radii.md,
  },
  remindLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.accent,
  },

  // --- Timeline ----------------------------------------------------------
  timeline: {
    paddingVertical: spacing.lg,
    paddingHorizontal: SHEET.padX,
  },
  step: {
    flexDirection: 'row',
    gap: SHEET.railGap,
  },
  rail: {
    width: SHEET.node,
    alignItems: 'center',
  },
  node: {
    width: SHEET.node,
    height: SHEET.node,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  nodeDone: {
    backgroundColor: '#F1FFF7',
    borderWidth: 1,
    borderColor: '#33A346',
  },
  stepText: {
    flex: 1,
    gap: spacing.xs,
  },
  // Figma keeps every title at full strength — the rail carries the state.
  stepTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.inkDeep,
  },
  stamp: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },
});
