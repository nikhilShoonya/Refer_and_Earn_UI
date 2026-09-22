import React, { useEffect, useState } from 'react';
import {
  Animated,
  BackHandler,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

import { Scrim } from './Scrim';

/** The web build has no RCTAnimation module, so transforms stay on the JS driver. */
const USE_NATIVE = Platform.OS !== 'web';

/** Fallback height used before the container has been measured. */
const ASSUMED_HEIGHT = 900;

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Footer pinned below the scrollable body, e.g. Reset / Apply. */
  footer?: React.ReactNode;
  /** Cap the sheet height as a fraction of the screen. */
  maxHeightRatio?: number;
}

/**
 * Sheet used for every overlay in the design — the referral-code sheet (Flow 2),
 * the referral journey, "How brokerage works" and the date filters.
 *
 * Deliberately NOT built on React Native's `Modal`: on web that portals to the
 * document root, which lets the sheet escape the iPhone shell and span the whole
 * browser window. Rendering it as an absolutely-positioned overlay keeps it
 * inside whatever container the screen occupies, and behaves identically on a
 * handset because there that container *is* the screen.
 *
 * Mount it as the last child of the screen root so it paints over the header
 * and the sticky footer.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeightRatio = 0.86,
}: Props) {
  const insets = useSafeAreaInsets();
  // Measured from the container rather than the window: inside the device frame
  // those differ, and the slide-in should start at the container's own edge.
  const [containerHeight, setContainerHeight] = useState(0);
  const [translate] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;

    translate.setValue(containerHeight || ASSUMED_HEIGHT);
    fade.setValue(0);

    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: USE_NATIVE }),
      Animated.spring(translate, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        useNativeDriver: USE_NATIVE,
      }),
    ]).start();
    // `containerHeight` only seeds the starting offset; re-running on every
    // measurement would restart the animation mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, translate, fade]);

  // Android's hardware back should dismiss the sheet, which `Modal` handled.
  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  function handleLayout(event: LayoutChangeEvent) {
    setContainerHeight(event.nativeEvent.layout.height);
  }

  // While closed, keep a zero-opacity probe mounted so the container height is
  // already known the moment the sheet opens.
  if (!visible) {
    return <View style={styles.probe} onLayout={handleLayout} />;
  }

  return (
    <View style={styles.root} onLayout={handleLayout}>
      {/* Figma dims every overlay with the same tinted+blurred component. */}
      <Animated.View style={[styles.scrimLayer, { opacity: fade }]}>
        <Scrim onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            maxHeight: (containerHeight || ASSUMED_HEIGHT) * maxHeightRatio,
            paddingBottom: insets.bottom || spacing.lg,
            transform: [{ translateY: translate }],
          },
        ]}
      >
        <View style={styles.grabber} />
        {title ? <Text style={[typography.displaySm, styles.title]}>{title}</Text> : null}

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
        >
          {children}
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Zero-opacity stand-in that keeps measuring the screen while closed. */
  probe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  scrimLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  sheet: {
    zIndex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg + 4,
    borderTopRightRadius: radii.lg + 4,
    paddingTop: spacing.md,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.indicator,
    marginBottom: spacing.md,
  },
  title: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
});
