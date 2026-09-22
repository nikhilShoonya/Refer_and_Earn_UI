import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PeriodSwitcher } from '../../../components/primitives';
import {
  ChevronRightSmallIcon,
  FunnelActivatedIcon,
  FunnelKycIcon,
  FunnelRegisteredIcon,
} from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';
import { FunnelCounts } from '../api/types';

const TILE = 32;

function Step({
  icon,
  label,
  value,
  align,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  align: 'flex-start' | 'center' | 'flex-end';
}) {
  return (
    <View style={[styles.step, { alignItems: align }]}>
      <View style={styles.tile}>{icon}</View>
      <View style={{ alignItems: align }}>
        <Text style={styles.stepLabel}>{label}</Text>
        <Text style={styles.stepValue}>{value}</Text>
      </View>
    </View>
  );
}

/** Figma draws the rule as a 1pt dash, 3 on / 3 off, in #ABCEB7. */
const DASH = { size: 3, gap: 3, colour: '#ABCEB7' };

/**
 * Horizontal dashed rule built from plain rects.
 *
 * `borderStyle: 'dashed'` cannot express Figma's 3/3 pattern — the browser
 * picks its own — and Android drops dashed borders entirely. Measuring the
 * width and laying out rects renders identically on both platforms, the same
 * approach the Day 0 divider uses.
 */
function DashedRule() {
  const [width, setWidth] = useState(0);
  const count = Math.ceil(width / (DASH.size + DASH.gap));

  return (
    <View
      style={styles.dash}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.dashSegment} />
      ))}
    </View>
  );
}

/** Dashed rail with a circled chevron at its midpoint. */
function Connector() {
  return (
    <View style={styles.connector}>
      <DashedRule />
      {/* Figma gives the disc a 5pt OUTSIDE stroke in the canvas colour, which
          masks the rule behind it. RN strokes inset, so the ring is a larger
          disc behind the tinted one. */}
      <View style={styles.chevronRing}>
        <View style={styles.chevronCircle}>
          <ChevronRightSmallIcon width={9} height={9} color="#899A8D" />
        </View>
      </View>
      <DashedRule />
    </View>
  );
}

/** "Referral Funnel" — Registered → KYC Completed → Activated. */
export function FunnelCard({
  counts,
  period = 'Current month',
  onChangePeriod,
  showPeriod = true,
}: {
  counts: FunnelCounts;
  period?: string;
  onChangePeriod?: () => void;
  /** First Referral's funnel header carries the title only (node 2265:15606). */
  showPeriod?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={typography.displaySm}>Referral Funnel</Text>
        {showPeriod ? <PeriodSwitcher label={period} onPress={onChangePeriod} /> : null}
      </View>

      <View style={styles.row}>
        {/*
          Connectors sit behind the steps. The spacers match the three 32pt icon
          tiles exactly, so each Connector fills the true gap between them and
          its chevron lands on the midpoint — the same geometry as the Figma
          frame, at any card width.
        */}
        <View style={styles.connectorLayer}>
          <View style={styles.tileSpacer} />
          <View style={styles.gap}>
            <Connector />
          </View>
          <View style={styles.tileSpacer} />
          <View style={styles.gap}>
            <Connector />
          </View>
          <View style={styles.tileSpacer} />
        </View>

        <Step
          icon={<FunnelRegisteredIcon width={16} height={16} />}
          label="Registered"
          value={counts.registered}
          align="flex-start"
        />
        <Step
          icon={<FunnelKycIcon width={16} height={16} />}
          label="KYC Completed"
          value={counts.kycCompleted}
          align="center"
        />
        <Step
          icon={<FunnelActivatedIcon width={16} height={16} />}
          label="Activated"
          value={counts.activated}
          align="flex-end"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Transparent so the page's wash shows through — Figma gives this card a
  // #D8EFDE hairline instead of the white fill used elsewhere.
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#D8EFDE',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Figma frame 1707486272 pads the steps row 8 top and bottom.
  row: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  step: {
    flex: 1,
    gap: spacing.sm,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radii.sm,
    backgroundColor: colors.funnelTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    ...typography.caption,
    color: colors.body,
  },
  stepValue: {
    ...typography.titleSm,
  },
  connectorLayer: {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    right: 0,
    // Vertically centred on the 32pt icon tiles.
    top: TILE / 2 - 8,
    height: 16,
    flexDirection: 'row',
  },
  tileSpacer: {
    width: TILE,
  },
  gap: {
    flex: 1,
  },
  connector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  dash: {
    flex: 1,
    height: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },
  dashSegment: {
    height: 1,
    width: DASH.size,
    marginRight: DASH.gap,
    backgroundColor: DASH.colour,
  },
  // 16 + 2x5 outside stroke = 26.
  chevronRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.borderCode,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
