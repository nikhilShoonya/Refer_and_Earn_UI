import { File, Paths } from 'expo-file-system';
import { StorageAccessFramework, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** What actually happened, so the caller can word the confirmation honestly. */
export type SaveOutcome = 'downloaded' | 'shared' | 'cancelled' | 'unavailable';

/**
 * Remembers the folder Android granted us.
 *
 * Android persists a Storage Access Framework grant across launches, but the
 * URI identifying it is ours to keep. Storing it means the folder chooser
 * appears once — on every later download the file is written straight to that
 * folder with no picker, no Drive, no share sheet.
 */
const FOLDER_MEMO = 'export-folder.txt';

function rememberedFolder(): string | null {
  try {
    const memo = new File(Paths.document, FOLDER_MEMO);
    if (!memo.exists) return null;
    const uri = memo.textSync().trim();
    return uri.length > 0 ? uri : null;
  } catch {
    return null;
  }
}

function rememberFolder(uri: string): void {
  try {
    const memo = new File(Paths.document, FOLDER_MEMO);
    if (memo.exists) memo.delete();
    memo.create();
    memo.write(uri);
  } catch {
    // Not being able to memoise only costs an extra prompt next time.
  }
}

function forgetFolder(): void {
  try {
    const memo = new File(Paths.document, FOLDER_MEMO);
    if (memo.exists) memo.delete();
  } catch {
    /* nothing to recover from */
  }
}

/**
 * Downloads a generated text file straight to the user's device.
 *
 * This is the Download button's path and it never opens a preview, a share
 * sheet or an external app — the file is written and that is all. The footer's
 * Share button is a separate flow and is untouched.
 *
 * - Web: a Blob behind an `<a download>`, typed so browsers save rather than
 *   render the CSV inline.
 * - Android: written into a real folder via the Storage Access Framework.
 * - iOS: sandboxed with no user-visible Downloads folder and no SAF, so
 *   "Save to Files" is the only way to put a file on the device.
 */
export async function saveTextFile(
  fileName: string,
  contents: string,
  mimeType = 'text/csv',
): Promise<SaveOutcome> {
  if (Platform.OS === 'web') return downloadOnWeb(fileName, contents);
  if (Platform.OS === 'android') return downloadOnAndroid(fileName, contents, mimeType);
  return shareFromCache(fileName, contents, mimeType);
}

function downloadOnWeb(fileName: string, contents: string): SaveOutcome {
  // Deliberately octet-stream, not text/csv: given a text type, browsers —
  // mobile Safari especially — render the file in a tab instead of saving it.
  // The .csv extension on the download attribute is what Excel keys off, so
  // the file still opens correctly.
  const blob = new Blob([contents], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName; // keeps the original name and extension
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'downloaded';
}

async function downloadOnAndroid(
  fileName: string,
  contents: string,
  mimeType: string,
): Promise<SaveOutcome> {
  const remembered = rememberedFolder();
  if (remembered) {
    const wrote = await writeInto(remembered, fileName, contents, mimeType);
    if (wrote) return 'downloaded';
    // The grant was revoked or the folder is gone — ask once more.
    forgetFolder();
  }

  let directoryUri: string;
  try {
    const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync(
      // Opens the chooser on Downloads rather than an arbitrary folder.
      StorageAccessFramework.getUriForDirectoryInRoot('Download'),
    );
    if (!permission.granted) return 'cancelled';
    directoryUri = permission.directoryUri;
  } catch {
    // Some OEM builds throw on cancel instead of returning granted:false.
    return 'cancelled';
  }

  const wrote = await writeInto(directoryUri, fileName, contents, mimeType);
  if (!wrote) return 'unavailable';
  rememberFolder(directoryUri);
  return 'downloaded';
}

/** SAF cannot write to a path that does not exist, so create then fill. */
async function writeInto(
  directoryUri: string,
  fileName: string,
  contents: string,
  mimeType: string,
): Promise<boolean> {
  try {
    const target = await StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName,
      mimeType,
    );
    await writeAsStringAsync(target, contents, { encoding: 'utf8' });
    return true;
  } catch {
    return false;
  }
}

async function shareFromCache(
  fileName: string,
  contents: string,
  mimeType: string,
): Promise<SaveOutcome> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);

  if (!(await Sharing.isAvailableAsync())) return 'unavailable';

  await Sharing.shareAsync(file.uri, {
    mimeType,
    dialogTitle: fileName,
    UTI: 'public.comma-separated-values-text',
  });
  return 'shared';
}
