import React, { createContext, useContext } from 'react';
import { View } from 'react-native';

/**
 * Android's blur does not sample "whatever happens to be behind this view" —
 * it re-draws one specific view into a bitmap. expo-blur 57 expects a ref to a
 * `BlurTargetView` naming that view, and without one
 * `blurMethod="dimezisBlurViewSdk31Plus"` degrades to no blur at all, logging
 * only a warning.
 *
 * The ref travels by context because the scrim that needs it sits several
 * levels down inside a sheet.
 *
 * The one hard rule, from the underlying library: *the target may not contain
 * a blur view that targets it*. Nesting the two makes each frame's draw
 * recurse — the target draws the blur view, which asks the target to draw —
 * and the process dies without a red box. `ScreenBackground` therefore renders
 * the target and the overlays as siblings.
 *
 * On iOS and web `BlurTargetView` is a plain `View` and `blurTarget` is
 * ignored, so none of this costs anything there.
 */
const BlurTargetContext = createContext<React.RefObject<View | null> | null>(null);

export const BlurTargetProvider = BlurTargetContext.Provider;

/** The target for any `<Scrim>` rendered below this point, if there is one. */
export function useBlurTarget(): React.RefObject<View | null> | undefined {
  return useContext(BlurTargetContext) ?? undefined;
}
