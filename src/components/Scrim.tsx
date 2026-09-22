import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useBlurTarget } from './BlurTarget';

/**
 * The "Overlay" component every Figma frame dims itself with (node 58:3999).
 *
 * It is a #C0CCC4 fill at 25% *plus* a BACKGROUND_BLUR of radius 12 — the blur
 * is easy to miss in the node JSON because it lives under `effects` rather than
 * `fills`, but without it the dimmed content stays sharp.
 *
 * Web gets `backdrop-filter` directly: expo-blur's web build hardcodes
 * `saturate(180%)` alongside the blur, which would shift the colours behind the
 * scrim. Native uses BlurView, where intensity 60 maps to the same 12px radius.
 */
/** The Overlay node's BACKGROUND_BLUR radius, read from the Figma file. */
const FIGMA_BLUR_RADIUS = 12;
const TINT = 'rgba(192, 204, 196, 0.25)';

/**
 * Figma's blur radius is not CSS's blur unit: its radius is roughly twice the
 * standard deviation `blur()` takes, so feeding the raw 12 into
 * `backdrop-filter` rendered the overlay about twice as heavy as the design —
 * the page behind it turned into an unreadable wash. Halving it matches the
 * Figma render, where the headline figures and the WhatsApp button stay
 * legible through the scrim.
 */
const CSS_BLUR_RADIUS = FIGMA_BLUR_RADIUS / 2;

/** expo-blur web is `intensity * 0.2` px; native follows the same scale. */
const NATIVE_INTENSITY = CSS_BLUR_RADIUS / 0.2;

export function Scrim({
  onPress,
  style,
  accessibilityLabel = 'Close',
}: {
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  const blurTarget = useBlurTarget();

  if (Platform.OS === 'web') {
    return (
      <Pressable
        style={[styles.fill, styles.webBlur, style]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  return (
    <BlurView
      intensity={NATIVE_INTENSITY}
      tint="default"
      // RenderNode on Android 12+, rather than the slow RenderScript path.
      // It blurs the view this ref names — without it expo-blur 57 warns and
      // silently drops to no blur, which is what shipped until now.
      blurMethod="dimezisBlurViewSdk31Plus"
      blurTarget={blurTarget}
      style={[styles.fill, style]}
    >
      <Pressable
        style={styles.tinted}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  webBlur: {
    backgroundColor: TINT,
    backdropFilter: `blur(${CSS_BLUR_RADIUS}px)`,
  } as ViewStyle,
  tinted: {
    flex: 1,
    backgroundColor: TINT,
  },
});
