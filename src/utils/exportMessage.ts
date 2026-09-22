import { SaveOutcome } from './saveFile';

/**
 * The confirmation has to match what actually happened. Saying "Exported
 * Successfully" after the user dismissed the folder picker, or after the file
 * only went to a share sheet, is the kind of quiet lie that sent us looking
 * for a download that was never written.
 */
export const EXPORT_MESSAGE: Record<SaveOutcome, string> = {
  downloaded: 'CSV Exported Successfully',
  shared: 'CSV ready to share',
  cancelled: 'Download cancelled',
  unavailable: 'Could not save the file',
};
