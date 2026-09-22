import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { BrokerageScreen } from '../screens/BrokerageScreen';
import { FaqsScreen } from '../screens/FaqsScreen';
import { HowItWorksScreen } from '../screens/HowItWorksScreen';
import { MyReferralsScreen } from '../screens/MyReferralsScreen';
import { ReferEarnHomeScreen } from '../screens/ReferEarnHomeScreen';
import { ReferralWiseBrokerageScreen } from '../screens/ReferralWiseBrokerageScreen';
import { SignupScreen } from '../screens/SignupScreen';

export type ReferAndEarnParamList = {
  ReferEarnHome: undefined;
  MyReferrals: undefined;
  Brokerage: undefined;
  ReferralWiseBrokerage: undefined;
  HowItWorks: undefined;
  Faqs: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<ReferAndEarnParamList>();

/**
 * Every frame in the design shows a back arrow, so always provide one. A
 * screen opened straight from a deep link starts the stack and has nothing to
 * pop — dispatching GO_BACK there is unhandled — so fall back to the hub.
 */
function backOf(navigation: {
  canGoBack: () => boolean;
  goBack: () => void;
  navigate: (screen: 'ReferEarnHome') => void;
}) {
  return () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('ReferEarnHome');
  };
}

/**
 * Feature-local stack. A host app can mount this whole navigator, or push the
 * individual screens onto its own stack — nothing here reaches outside the
 * feature except the injected `ReferralClient`.
 */
export function ReferAndEarnNavigator({
  onExit,
}: {
  /**
   * Called by the hub's back arrow once the stack has nothing left to pop.
   * The design gives the hub a back arrow, but it is this stack's root, so
   * only the host knows where "back" leads.
   */
  onExit?: () => void;
} = {}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ReferEarnHome">
        {({ navigation }) => (
          <ReferEarnHomeScreen
            onBack={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else onExit?.();
            }}
            onOpenFaqs={() => navigation.navigate('Faqs')}
            onOpenHowItWorks={() => navigation.navigate('HowItWorks')}
            onOpenMyReferrals={() => navigation.navigate('MyReferrals')}
            onOpenBrokerage={() => navigation.navigate('Brokerage')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="MyReferrals">
        {({ navigation }) => <MyReferralsScreen onBack={backOf(navigation)} />}
      </Stack.Screen>

      <Stack.Screen name="Brokerage">
        {({ navigation }) => (
          <BrokerageScreen
            onBack={backOf(navigation)}
            onOpenAll={() => navigation.navigate('ReferralWiseBrokerage')}
            onOpenFaqs={() => navigation.navigate('Faqs')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ReferralWiseBrokerage">
        {({ navigation }) => <ReferralWiseBrokerageScreen onBack={backOf(navigation)} />}
      </Stack.Screen>

      <Stack.Screen name="HowItWorks">
        {({ navigation }) => <HowItWorksScreen onBack={backOf(navigation)} />}
      </Stack.Screen>

      <Stack.Screen name="Faqs">
        {({ navigation }) => <FaqsScreen onBack={backOf(navigation)} />}
      </Stack.Screen>

      <Stack.Screen name="Signup">
        {({ navigation }) => <SignupScreen onBack={backOf(navigation)} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
