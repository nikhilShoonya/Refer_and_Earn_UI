import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Scrim } from '../../../components/Scrim';
import { CalendarIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';
import { DateRangeFilter } from '../api/types';

import { CalendarSheet, DayRange } from './CalendarSheet';

/**
 * Geometry from Figma nodes 2265:14096 (collapsed) and 2265:14165 (Date Range
 * selected). Deliberately not built on `BottomSheet`: the design has no grabber
 * handle, a left-aligned Bricolage title, and its own button row.
 */
const DRAWER = {
  paddingX: 24,
  radius: 16,
  optionGap: 16,
  radioSize: 18,
  /** Ring is 18 but the row is 20, which is what makes the pitch 36. */
  optionHeight: 20,
  fieldHeight: 42,
  buttonHeight: 44,
  buttonGap: 16,
};

/** Scrim is #C0CCC4 at 25%, matching the QR overlay. */
type Preset = 'current' | 'previous' | 'range';

const pad = (n: number) => String(n).padStart(2, '0');

/** dd/mm/yyyy, as the field is labelled. */
function formatDay(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** ISO day, which is what ReferralClient expects. */
function isoDay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const OPTIONS: { key: Preset; label: string }[] = [
  { key: 'current', label: 'Current Month' },
  { key: 'previous', label: 'Previous Month' },
  { key: 'range', label: 'Date Range' },
];

function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={styles.radio}>{selected ? <View style={styles.radioDot} /> : null}</View>
  );
}

export function FilterByDateSheet({
  visible,
  onClose,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: DateRangeFilter | undefined) => void;
}) {
  const insets = useSafeAreaInsets();
  const [preset, setPreset] = useState<Preset>('current');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [range, setRange] = useState<DayRange | null>(null);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  function handleApply() {
    if (preset === 'current') onApply({ kind: 'current_month' });
    else if (preset === 'previous') onApply({ kind: 'previous_month' });
    else if (range?.to) {
      onApply({ kind: 'range', from: isoDay(range.from), to: isoDay(range.to) });
    } else {
      // Range chosen but no dates picked yet — nothing to filter on.
      onApply(undefined);
    }
    onClose();
  }

  function handleReset() {
    setPreset('current');
    setRange(null);
    onApply(undefined);
  }

  return (
    <View style={styles.root}>
      <Scrim onPress={onClose} accessibilityLabel="Close" />

      <View style={[styles.drawer, { paddingBottom: insets.bottom || spacing.lg }]}>
        <Text style={styles.title}>Filter by Date</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = preset === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setPreset(option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={styles.option}
              >
                <Radio selected={selected} />
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* One combined field holding both ends of the range, per the design. */}
        {preset === 'range' ? (
          <Pressable
            style={styles.field}
            onPress={() => setCalendarOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Pick a date range"
          >
            {/* Figma greys this to match the placeholder, not body ink. */}
            <CalendarIcon width={24} height={24} color="#888888" />
            <Text style={[styles.fieldPlaceholder, range && styles.fieldValue]}>
              {range ? formatDay(range.from) : 'dd/mm/yyyy'}
            </Text>
            <Text style={styles.fieldDash}>-</Text>
            <Text style={[styles.fieldPlaceholder, range?.to && styles.fieldValue]}>
              {range?.to ? formatDay(range.to) : 'dd/mm/yyyy'}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.buttons}>
          <Pressable style={[styles.button, styles.reset]} onPress={handleReset}>
            <Text style={styles.resetLabel}>Reset</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.apply]} onPress={handleApply}>
            <Text style={styles.applyLabel}>Apply</Text>
          </Pressable>
        </View>
      </View>

      <CalendarSheet
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelect={setRange}
        initial={range}
      />
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
    marginHorizontal: spacing.gutter,
    borderTopLeftRadius: DRAWER.radius,
    borderTopRightRadius: DRAWER.radius,
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    lineHeight: 22,
    color: colors.ink,
    paddingHorizontal: DRAWER.paddingX,
  },
  options: {
    gap: DRAWER.optionGap,
    paddingHorizontal: DRAWER.paddingX,
    paddingTop: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    height: DRAWER.optionHeight,
    gap: spacing.sm,
  },
  radio: {
    width: DRAWER.radioSize,
    height: DRAWER.radioSize,
    borderRadius: DRAWER.radioSize / 2,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  optionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 18,
    color: colors.ink,
  },
  optionLabelSelected: {
    fontFamily: fontFamily.semibold,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: DRAWER.fieldHeight,
    marginHorizontal: DRAWER.paddingX,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#D8EFDE',
    backgroundColor: colors.surface,
  },
  fieldPlaceholder: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: '#888888',
  },
  fieldValue: {
    color: colors.ink,
  },
  fieldDash: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.body,
  },
  buttons: {
    flexDirection: 'row',
    gap: DRAWER.buttonGap,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  button: {
    flex: 1,
    flexBasis: 0,
    height: DRAWER.buttonHeight,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reset: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  resetLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.accent,
  },
  // Same 2pt border as Reset, in its own fill colour: without it RN Web lays
  // Reset's border outside the flex basis and the pair comes out 4pt uneven,
  // where Figma has them equal.
  apply: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  applyLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.surface,
  },
});
