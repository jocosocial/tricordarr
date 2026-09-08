import * as mime from 'react-native-mime-types';

/**
 * Payload for the download bottom sheet. Contents are UTF-8 text;
 * the mime type selects the file extension when saving or sharing.
 */
export interface DownloadSheetContent {
  /** Sheet title. Defaults to "Download". */
  title?: string;
  /** Filename without extension; SAF/createFile and share add it from the mime type. */
  baseName: string;
  mimeType: string;
  contents: string;
}

/**
 * File extension (no leading dot) for a download mime type.
 *
 * text/vcard is overridden to vcf: mime-db's IANA-registered extension is
 * "vcard", but "vcf" is the extension every contacts app actually expects.
 */
export const getDownloadFileExtension = (mimeType: string): string => {
  if (mimeType === 'text/vcard') {
    return 'vcf';
  }
  return mime.extension(mimeType) || 'txt';
};

/**
 * Filename with extension for sharing, e.g. `event_feedback_reports.csv`.
 */
export const getDownloadFileName = (content: DownloadSheetContent): string => {
  return `${content.baseName}.${getDownloadFileExtension(content.mimeType)}`;
};

/**
 * User-facing title for the download sheet.
 */
export const getDownloadSheetTitle = (content?: DownloadSheetContent): string => {
  return content?.title ?? 'Download';
};
