import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  useFonts,
} from '@expo-google-fonts/figtree';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeviceFrame, IPHONE_16_METRICS } from './src/components/DeviceFrame';
import { DeviceStatusBar } from './src/components/DeviceStatusBar';
import { ReferAndEarnNavigator, ReferralProvider } from './src/features/referAndEarn';
import type { MockScenario } from './src/features/referAndEarn';
import { colors, radii, spacing } from './src/theme/tokens';
import { typography } from './src/theme/typography';

const IS_WEB = Platform.OS === 'web';

const linking = {
  prefixes: ['shoonya://', 'https://shoonya.com'],
  config: {
    screens: {
      ReferEarnHome: 'refer',
      MyReferrals: 'refer/referrals',
      Brokerage: 'refer/brokerage',
      ReferralWiseBrokerage: 'refer/brokerage/referrals',
      HowItWorks: 'refer/how-it-works',
      Faqs: 'refer/faqs',
      Signup: 'signup',
    },
  },
};

const SCENARIOS: { key: MockScenario; label: string }[] = [
  { key: 'day0', label: 'Day 0' },
  { key: 'firstReferral', label: '1st referral' },
  { key: 'day1', label: 'Day 1' },
];

/**
 * Demo harness.
 *
 * In the browser the feature is rendered inside an iPhone 16 shell so it reads
 * as an app rather than a full-width web page; on a handset `DeviceFrame` is a
 * passthrough. The scenario chips are scaffolding for reviewing the three
 * lifecycle states in the Figma file — a host app would mount
 * `ReferAndEarnNavigator` in its own `ReferralProvider` and never render any
 * of this.
 */
export default function App() {
  // Day 0 is the first-run state, so the demo opens where a new user would.
  const [scenario, setScenario] = useState<MockScenario>('day0');

  /**
   * The chips select a lifecycle state of the *hub*, so switching one has to
   * land there.
   *
   * `ReferralProvider` is keyed on the scenario so its async state resets, but
   * that remounts the `NavigationContainer` nested inside it — and on web a
   * fresh container reads its initial route from the URL. Standing on
   * /refer/referrals, switching to Day 0 therefore restored My Referrals
   * instead of the Day 0 hub. Point the URL back at the hub first so the
   * remounted container reads that. Native needs nothing: with no linking, a
   * remount already returns to the stack's initial route.
   */
  const handleScenarioChange = useCallback((next: MockScenario) => {
    if (IS_WEB && typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/refer');
    }
    setScenario(next);
  }, []);

  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    // On web there are no real insets to read, so hand the provider the
    // handset's own metrics: the layout then reserves the same space for the
    // Dynamic Island and home indicator that it would on device.
    <SafeAreaProvider initialMetrics={IS_WEB ? IPHONE_16_METRICS : undefined}>
      <StatusBar style="dark" />

      <DeviceFrame>
        {/* Remounting on scenario change resets the feature's async state. */}
        <ReferralProvider key={scenario} scenario={scenario}>
          <NavigationContainer linking={linking}>
            <ReferAndEarnNavigator />
          </NavigationContainer>
        </ReferralProvider>
        <DeviceStatusBar />
      </DeviceFrame>

      <ScenarioSwitcher scenario={scenario} onChange={handleScenarioChange} />
    </SafeAreaProvider>
  );
}

/**
 * Lives in its own component so it can read the safe-area inset: on a handset
 * it floats over the app and has to clear the status bar, while on web it sits
 * above the phone shell.
 */
function ScenarioSwitcher({
  scenario,
  onChange,
}: {
  scenario: MockScenario;
  onChange: (next: MockScenario) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="scenario-switcher"
      style={[styles.switcher, { top: (IS_WEB ? 0 : insets.top) + spacing.lg }]}
    >
      {SCENARIOS.map((item) => {
        const active = scenario === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="button"
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  // Outside the phone shell on web; floating over the app on a handset.
  switcher: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1000,
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: 'rgba(8,47,37,0.88)',
    borderRadius: radii.pill,
    padding: 4,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  chipActive: { backgroundColor: colors.accent },
  chipLabel: { ...typography.micro, color: '#FFFFFF' },
  chipLabelActive: { color: colors.ink },
});
