# Shoonya — Refer & Earn (frontend)

React Native + TypeScript implementation of the Refer & Earn feature, built from
the Figma file [Refer & Earn (Copy)](https://www.figma.com/design/tzQd5tuI4X51qsEhclFwjA/Refer---Earn--Copy-?node-id=4-92),
page **Ready to Dev** (`4:92`). File key `tzQd5tuI4X51qsEhclFwjA`.

Re-pull the Figma-exported artwork with:

```bash
FIGMA_TOKEN=figd_... npm run figma:assets
```

Mock data only — there is no backend, and nothing here calls the network.

## Running it

```bash
npm install
npm start          # Expo dev server; press a / i / w
npm run web        # browser — renders inside an iPhone 16 shell
``` 

Verification:

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # jest
```

## App view (iPhone 16)

The browser build renders the feature inside an iPhone 16 shell — 393 × 852 pt,
Dynamic Island, home indicator, 55pt screen radius — so the web preview reads as
an app rather than a full-width page. `src/components/DeviceFrame.tsx` owns it
and is a **passthrough on native**, where the handset is already the frame. It
scales down to fit short windows instead of clipping.

`SafeAreaProvider` is handed the handset's real metrics on web
(`insets: { top: 59, bottom: 34 }`), so layout reserves the same space for the
Dynamic Island and home indicator that it would on device.

Two consequences worth knowing:

- **Sheets do not use React Native's `Modal`.** On web `Modal` portals to the
  document root, which made every bottom sheet escape the shell and span the
  browser window. `BottomSheet` is an absolutely-positioned in-tree overlay
  instead, which behaves identically on a handset and adds an explicit
  `BackHandler` for Android's hardware back.
- **The Figma frames were drawn at 390 × 844** (iPhone 14/15). Layout is fluid,
  so the extra 3pt of width just widens the gutters; nothing is pinned to fixed
  pixel offsets.

The right-hand status icons (signal, Wi-Fi, battery) are intentionally not
drawn. iOS paints those over the app on a real device, and inventing them would
put wrong artwork on screen. Only a live clock is rendered, and only on web.

## Architecture

The feature is self-contained under `src/features/referAndEarn/` and talks to
the outside world through exactly one seam.

```
src/
  theme/            tokens.ts, typography.ts   — values read off the Figma nodes
  components/       ScreenBackground, AppHeader, BottomSheet, primitives
  icons/            re-exports the Figma-exported SVGs
  utils/            currency / date / initials formatting
  features/referAndEarn/
    api/            types.ts          ← ReferralClient interface (the seam)
                    mockReferralClient.ts
                    ReferralProvider.tsx
                    useAsync.ts
    data/           mockData.ts       — fixtures transcribed from the frames
    components/     EarningsCard, FunnelCard, ContributorsCard, ReferralRow,
                    ValuePropsCard, FaqAccordion, ReferralFooter
    screens/        ReferEarnHome, MyReferrals, Brokerage,
                    ReferralWiseBrokerage, HowItWorks, Faqs, Signup
    sheets/         ReferralCode (Flow 2), ReferralJourney,
                    HowBrokerageWorks, FilterByDate, Qr, Celebration
    navigation/     ReferAndEarnNavigator.tsx
    index.ts        ← public surface
```

### SDK-readiness

No screen or component performs I/O. Everything goes through `ReferralClient`
(`api/types.ts`), supplied by `ReferralProvider`:

```tsx
// Today — standalone demo, in-memory fixtures:
<ReferralProvider scenario="day1">
  <ReferAndEarnNavigator />
</ReferralProvider>

// Later — host app injects the real client, nothing else changes:
<ReferralProvider client={shoonyaSdk.referrals}>
  <ReferAndEarnNavigator />
</ReferralProvider>
```

When this is packaged, `src/features/referAndEarn/index.ts` becomes the package
entry point and the folder layout stays private. Packaging has **not** been done
yet, as requested.

### Lifecycle states

The Figma file draws three states of the hub. The demo harness in `App.tsx`
switches between them via the chips above the device; that bar is scaffolding
and would not ship.

| Scenario | Frame |
|---|---|
| `day0` | Day 0 — empty state, hero illustration, value props |
| `firstReferral` | First Referral Registered — zeros + celebration sheet |
| `day1` | Day 1 — populated dashboard |

## Assets

Every icon and image is the file Figma exported — none are hand-drawn.

- `assets/figma/icons/*.svg` — 25 icons, imported as components via
  `react-native-svg-transformer`
- `assets/figma/images/hero-refer.png` — Day 0 illustration (node `2265:14208`, 3x)
- `assets/figma/images/qr-code.png` — footer QR (3x)

Two deliberate post-processing passes were applied to the exported files:

1. Monochrome UI icons had their hardcoded `stroke`/`fill` rewritten to
   `currentColor` so they can be tinted from the theme.
2. Three icons carried a no-op full-bounds `clipPath`. Those were stripped —
   their ids collided when the same icon rendered twice on one screen, which
   made the glyph disappear. Artwork is unchanged.

The avatars in Figma use sample photographs. Those are user data, so rows render
initials monograms instead, which is also what the Figma referral rows do.

## Flow 2

Per the brief, the referral code is captured with **Flow 2**: a collapsed
"Have a Referral Code?" link on signup opens a bottom sheet; once verified it
collapses to a chip naming the referrer with a Change action. Flows 1 and 3 from
the design are not built — see open issue #10 in
[docs/figma-design-spec.txt](docs/figma-design-spec.txt).

`src/features/referAndEarn/screens/SignupScreen.tsx` is a reference host for the
sheet. In the real app signup belongs to onboarding; the reusable part is
`sheets/ReferralCodeSheet.tsx`.

## Known deviations from Figma

These are deliberate. The design's own open issues are catalogued in
[docs/figma-design-spec.txt](docs/figma-design-spec.txt).

- **Day 1 totals do not reconcile.** ₹2,600 + ₹5,900 ≠ ₹6,200. The headline is
  kept verbatim from Figma rather than recomputed, so the screen matches the
  design. `mockData.ts` flags this; swap to a derived total once product
  confirms the formula.
- **Background blur.** Figma layers a 13px and two 44px layer blurs. React
  Native has no layer-blur primitive, so `ScreenBackground` approximates them
  with a linear gradient plus two translucent circles.
- **Stale component text not shipped.** "High Movement", "07 Scrips",
  "Cancel Order", "Discard" etc. appear in the Figma frames as unoverridden
  design-system instance defaults. They are not real content and were omitted.
- **Status pill "Pending"** is rendered where Figma shows it, but it is not part
  of the documented three-stage lifecycle (open issue #6).

## Visual QA

Run against the react-native-web target in a real browser at iPhone 16 size,
compared frame by frame against Figma. This machine has no Android SDK, no Java and
cannot run an iOS simulator, so native rendering was **not** verified — worth
doing before sign-off.

Captures: [docs/qa/](docs/qa/)

Issues found and fixed during that pass:

| Issue | Fix |
|---|---|
| Funnel connector chevrons off-centre | Rebuilt the connector layer with spacers matching the 32pt icon tiles |
| Header flush to the top on web | Safe-area metrics now come from the iPhone 16 profile (59pt top) |
| Value-props card shrink-wrapped, captions wrapped | `alignSelf: stretch` — the Day 0 column centres its children |
| Bottom sheets invisible behind the scrim | Explicit `zIndex`; the absolutely-positioned scrim was painting over the in-flow sheet |
| Sheet animation not running on web | `useNativeDriver` only on native; web has no `RCTAnimation` |
| Percent icon rendering as a sliver | Stripped colliding no-op `clipPath` ids |
| Day 0 showed a nav title | Figma's Day 0 frame has no title — the dark badge is the wordmark |
| Bottom sheets escaped the iPhone shell on web | Replaced `Modal` with an in-tree absolute overlay |
| Signup crowded the Dynamic Island | It has no `AppHeader`, so it now applies the top safe-area inset itself |
