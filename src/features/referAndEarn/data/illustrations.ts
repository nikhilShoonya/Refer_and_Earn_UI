import type { ImageSourcePropType } from 'react-native';

/**
 * Figma-exported artwork for the How it Works screen (node 2265:14909).
 *
 * These are large vectorised illustrations rather than icons, so they ship as
 * PNG exports at 3x. Re-pull them with `npm run figma:assets`.
 */
export const hiwIllustrations: Record<string, ImageSourcePropType> = {
  network: require('../../../../assets/figma/images/hiw-network.png'),
  step1: require('../../../../assets/figma/images/hiw-step-1.png'),
  step2: require('../../../../assets/figma/images/hiw-step-2.png'),
  step3: require('../../../../assets/figma/images/hiw-step-3.png'),
  step4: require('../../../../assets/figma/images/hiw-step-4.png'),
};
