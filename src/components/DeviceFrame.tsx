import React from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import { colors } from '../theme/tokens';

/**
 * iPhone 16 logical geometry. The Figma frames were drawn at 390x844
 * (iPhone 14/15); the extra 3pt of width and 8pt of height come free because
 * every screen lays out fluidly rather than at fixed pixel offsets.
 */
export const IPHONE_16 = {
  width: 393,
  height: 852,
  /** Screen corner radius. */
  radius: 55,
  /** Thickness of the titanium band drawn around the display. */
  bezel: 11,
  /** Dynamic Island pill. */
  island: { width: 125, height: 36, top: 11 },
  /** Safe-area insets reported by a Dynamic Island device. */
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
} as const;

/** Metrics handed to SafeAreaProvider so web layout matches a real handset. */
export const IPHONE_16_METRICS = {
  frame: { x: 0, y: 0, width: IPHONE_16.width, height: IPHONE_16.height },
  insets: IPHONE_16.insets,
};

const IS_WEB = Platform.OS === 'web';
/** Breathing room around the device so the shell never touches the window edge. */
const PAGE_MARGIN = 48;

/**
 * Renders children inside an iPhone 16 shell when running in a browser, so the
 * web build reads as an app rather than a full-width page. On a real device it
 * is a passthrough — the handset is already the frame.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (!IS_WEB) {
    return <>{children}</>;
  }

  // Shrink to fit short or narrow windows rather than clipping the phone.
  const outerWidth = IPHONE_16.width + IPHONE_16.bezel * 2;
  const outerHeight = IPHONE_16.height + IPHONE_16.bezel * 2;
  const scale = Math.min(
    1,
    (width - PAGE_MARGIN) / outerWidth,
    (height - PAGE_MARGIN) / outerHeight,
  );

  return (
    <View style={styles.page}>
      <View style={[styles.shell, { transform: [{ scale }] }]}>
        <View style={styles.screen}>
          {children}

          {/* Chrome sits above the app, like the real device's. */}
          <View style={styles.island} />
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EDEA',
  },
  shell: {
    width: IPHONE_16.width + IPHONE_16.bezel * 2,
    height: IPHONE_16.height + IPHONE_16.bezel * 2,
    borderRadius: IPHONE_16.radius + IPHONE_16.bezel,
    padding: IPHONE_16.bezel,
    backgroundColor: '#1D1D1F',
    boxShadow: '0px 18px 40px rgba(10, 45, 34, 0.28)',
  },
  screen: {
    flex: 1,
    borderRadius: IPHONE_16.radius,
    overflow: 'hidden',
    backgroundColor: colors.canvas,
  },
  island: {
    position: 'absolute',
    top: IPHONE_16.island.top,
    alignSelf: 'center',
    width: IPHONE_16.island.width,
    height: IPHONE_16.island.height,
    borderRadius: IPHONE_16.island.height / 2,
    backgroundColor: '#000000',
    pointerEvents: 'none',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 139,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    pointerEvents: 'none',
  },
});
