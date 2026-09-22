import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Scrim } from '../../../components/Scrim';
import { colors, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';

/**
 * Geometry from Figma node 2265:13452 ("Calendar").
 *
 * A centred card, like the QR overlay — not a bottom sheet. Selecting a range
 * paints the start cell filled, the days between in #FEE1BA, and the end cell
 * outlined.
 *
 * Figma draws no month arrows and puts a scrollbar down the card's right edge,
 * so months are a vertical scroller rather than a paged single month: one
 * month fills the card exactly, and you scroll to reach the others.
 *
 * Figma's calendar instance carries Poppins/Roboto from the component library
 * it came from; this uses the app's own Figtree so type stays consistent with
 * every other screen.
 */
const CAL = {
  radius: 8,
  rowHeight: 40,
  headerHeight: 24,
  weekdayHeight: 40,
  /** Figma leaves a 5pt gap between the weekday strip and the first row. */
  gridGap: 5,
  /** Content sits 18 in from the card edge, giving 46pt cells at 390. */
  padX: 18,
  dotSize: 4,
};

/** Months either side of the current one that the scroller holds. */
export const MONTHS_BACK = 6;
export const MONTHS_FORWARD = 1;
export const MONTHS_RENDERED = MONTHS_BACK + MONTHS_FORWARD + 1;

/**
 * One month, to the pixel: the card is 16 + this + 6 = 339 tall in Figma, so
 * exactly one block shows at a time and the offset below parks the current
 * month at the top without measuring anything.
 */
const MONTH_BLOCK =
  CAL.headerHeight + spacing.sm + CAL.weekdayHeight + CAL.gridGap + 6 * CAL.rowHeight;
const MONTH_GAP = spacing.lg;

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Local-midnight day key, so comparisons ignore time and timezone drift. */
function dayKey(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

interface Cell {
  date: Date;
  inMonth: boolean;
}

/** Six rows of seven, padded from the surrounding months. */
function buildGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}

export interface DayRange {
  from: Date;
  to: Date | null;
}

export function CalendarSheet({
  visible,
  onClose,
  onSelect,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (range: DayRange) => void;
  initial?: DayRange | null;
}) {
  const today = new Date();
  const [range, setRange] = useState<DayRange | null>(initial ?? null);
  // A callback ref against the one method used, rather than ScrollView's
  // instance type: that resolves differently between this app's RN typings
  // and the SDK package's, and this is all the scroller is asked to do.
  const scrollRef = useRef<{ scrollTo(o: { y: number; animated: boolean }): void } | null>(
    null,
  );
  const parked = useRef(false);

  const months = Array.from(
    { length: MONTHS_RENDERED },
    (_, i) => new Date(today.getFullYear(), today.getMonth() - MONTHS_BACK + i, 1),
  );

  // Re-read the caller's range each time the sheet opens, so Reset in the
  // drawer behind it cannot leave a stale selection painted on the grid. This
  // is the "adjust state while rendering" pattern rather than an effect: the
  // sheet stays mounted between opens, so there is nothing to subscribe to.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setRange(initial ?? null);
  }

  // The card unmounts while hidden, so clearing this on close means the next
  // open parks on the current month again.
  useEffect(() => {
    if (!visible) parked.current = false;
  }, [visible]);

  /**
   * Dismissing is what commits. The grid stays up after the second tap so the
   * range is visible, which means tapping outside has to carry the selection
   * out with it — otherwise what the user just picked would be discarded.
   */
  const handleClose = useCallback(() => {
    if (range) onSelect(range);
    onClose();
  }, [range, onSelect, onClose]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, handleClose]);

  if (!visible) return null;

  function pick(date: Date) {
    // First tap opens a range, the second closes it — but only in the data.
    // The sheet stays open so the painted range can be checked and corrected;
    // a third tap starts over. A pick earlier than the start becomes the new
    // start rather than an invalid backwards range.
    if (!range || range.to !== null) {
      setRange({ from: date, to: null });
      return;
    }
    if (dayKey(date) < dayKey(range.from)) {
      setRange({ from: date, to: null });
      return;
    }
    setRange({ from: range.from, to: date });
  }

  const fromKey = range ? dayKey(range.from) : null;
  const toKey = range?.to ? dayKey(range.to) : null;
  const todayKey = dayKey(today);

  return (
    <View style={styles.root}>
      <Scrim onPress={handleClose} accessibilityLabel="Close calendar" />

      <View style={styles.card}>
        {/* Figma has no month arrows and rules a scrollbar down the right
            edge, so the months are a scroller. One block fills the card, and
            the offset below opens on the current month. */}
        <ScrollView
          ref={(node) => {
            scrollRef.current = node as typeof scrollRef.current;
          }}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          // Native overlays the indicator, which is how Figma draws it. On web a
          // real scrollbar would eat 15pt of the content box and shrink every
          // cell, so it is hidden there — the grid still scrolls.
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
          onContentSizeChange={() => {
            if (parked.current) return;
            parked.current = true;
            scrollRef.current?.scrollTo({
              y: MONTHS_BACK * (MONTH_BLOCK + MONTH_GAP),
              animated: false,
            });
          }}
        >
          {months.map((first) => (
            <View key={`${first.getFullYear()}-${first.getMonth()}`}>
              <View style={styles.header}>
                {/* Two nodes in Figma, set further apart than a space. */}
                <Text style={styles.monthLabel}>{MONTHS[first.getMonth()]}</Text>
                <Text style={styles.monthLabel}>{first.getFullYear()}</Text>
              </View>

              <View style={styles.weekdays}>
                {WEEKDAYS.map((day, i) => (
                  <Text key={i} style={styles.weekday}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.grid}>
                {buildGrid(first.getFullYear(), first.getMonth()).map((cell, i) => {
                  const key = dayKey(cell.date);
                  const isStart = fromKey !== null && key === fromKey;
                  const isEnd = toKey !== null && key === toKey;
                  const isBetween =
                    fromKey !== null && toKey !== null && key > fromKey && key < toKey;

                  return (
                    <Pressable
                      key={i}
                      onPress={() => pick(cell.date)}
                      accessibilityRole="button"
                      accessibilityLabel={cell.date.toDateString()}
                      style={[
                        styles.day,
                        isBetween && styles.dayBetween,
                        isStart && styles.dayStart,
                        isEnd && styles.dayEnd,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayLabel,
                          !cell.inMonth && styles.dayLabelMuted,
                          isStart && styles.dayLabelStart,
                        ]}
                      >
                        {cell.date.getDate()}
                      </Text>
                      {key === todayKey && !isStart ? <View style={styles.todayDot} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const SEVENTH = '14.2857%';

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 16 above the months and 6 below, which with one 317pt block is Figma's
  // 339pt card.
  card: {
    zIndex: 1,
    alignSelf: 'stretch',
    marginHorizontal: spacing.gutter,
    paddingHorizontal: CAL.padX,
    paddingTop: spacing.lg,
    paddingBottom: 6,
    borderRadius: CAL.radius,
    backgroundColor: colors.surface,
  },
  // Exactly one month tall, so the card never grows with the window size.
  scroll: {
    height: MONTH_BLOCK,
  },
  scrollContent: {
    gap: MONTH_GAP,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: CAL.headerHeight,
  },
  monthLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: '#494E50',
  },
  weekdays: {
    flexDirection: 'row',
    height: CAL.weekdayHeight,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: CAL.gridGap,
    borderRadius: CAL.radius,
    backgroundColor: colors.surfaceGreenTint,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.body,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: SEVENTH,
    height: CAL.rowHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBetween: {
    backgroundColor: '#FEE1BA',
  },
  dayStart: {
    backgroundColor: colors.accent,
    borderTopLeftRadius: CAL.radius,
    borderBottomLeftRadius: CAL.radius,
  },
  dayEnd: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderTopRightRadius: CAL.radius,
    borderBottomRightRadius: CAL.radius,
  },
  dayLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.body,
  },
  dayLabelMuted: {
    color: '#888888',
  },
  // Figma keeps the numeral dark on the amber start cell rather than reversing
  // it out to white.
  dayLabelStart: {
    color: colors.ink,
  },
  todayDot: {
    position: 'absolute',
    bottom: 6,
    width: CAL.dotSize,
    height: CAL.dotSize,
    borderRadius: CAL.dotSize / 2,
    backgroundColor: colors.accent,
  },
});
