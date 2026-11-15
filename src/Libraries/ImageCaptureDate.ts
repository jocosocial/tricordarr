import type {Image} from 'react-native-image-crop-picker';

import {formatSecondsToHumanReadable} from '#src/Libraries/DateTime';

/**
 * Photos older than this may not be uploaded to the Photostream.
 * See the Swiftarr "Client Conventions" docs (swiftarr#522).
 */
export const PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS = 2 * 60 * 60;

/**
 * Allowance for a capture date slightly ahead of the device clock (camera clock drift).
 */
export const PHOTOSTREAM_CAPTURE_FUTURE_TOLERANCE_SECONDS = 5 * 60;

const EXIF_DATETIME_PATTERN = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/;

/**
 * Parse an EXIF date string ("YYYY:MM:DD HH:MM:SS"). EXIF carries no timezone so the
 * value is interpreted as device-local time.
 *
 * @param value The raw EXIF date string.
 * @returns The parsed date, or undefined if the value is missing or malformed.
 */
export const parseExifDateTime = (value: unknown): Date | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const match = EXIF_DATETIME_PATTERN.exec(value.trim());
  if (!match) {
    return undefined;
  }
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second);
  if (isNaN(date.getTime()) || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }
  return date;
};

/**
 * Determine when a picked image was taken. Sources in order of preference:
 * the iOS PHAsset creationDate, the iOS nested {Exif} dictionary, then the
 * Android flat EXIF map. modificationDate is deliberately never used since on
 * Android it is the timestamp of the picker's temporary copy.
 *
 * The image must be picked with `includeExif: true` and without cropping, since
 * the cropped output does not retain the original capture metadata.
 *
 * @param image The image returned by react-native-image-crop-picker.
 * @returns The capture date, or undefined if it cannot be determined.
 */
export const getImageCaptureDate = (image: Image): Date | undefined => {
  if (image.creationDate) {
    const seconds = Number(image.creationDate);
    if (Number.isFinite(seconds) && seconds > 0) {
      return new Date(seconds * 1000);
    }
  }
  const exif = image.exif;
  if (!exif || typeof exif !== 'object') {
    return undefined;
  }
  const iosExif = exif['{Exif}'];
  if (iosExif && typeof iosExif === 'object') {
    const iosDate = parseExifDateTime(iosExif.DateTimeOriginal) ?? parseExifDateTime(iosExif.DateTimeDigitized);
    if (iosDate) {
      return iosDate;
    }
  }
  return (
    parseExifDateTime(exif.DateTimeOriginal) ??
    parseExifDateTime(exif.DateTimeDigitized) ??
    parseExifDateTime(exif.DateTime)
  );
};

/**
 * Throw if a photo's capture date does not permit uploading it to the Photostream.
 *
 * @param capturedAt When the photo was taken, if known.
 * @param now The current time. Overridable for testing.
 * @throws {Error} With a user-facing message when the upload is not allowed.
 */
export function assertPhotostreamCaptureDateAllowed(
  capturedAt: Date | undefined,
  now: Date = new Date(),
): asserts capturedAt is Date {
  const maxAge = formatSecondsToHumanReadable(PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS);
  if (!capturedAt || isNaN(capturedAt.getTime())) {
    throw new Error(
      `Could not determine when this photo was taken. Only photos taken within the last ${maxAge} can be posted.`,
    );
  }
  const ageSeconds = (now.getTime() - capturedAt.getTime()) / 1000;
  if (ageSeconds > PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS) {
    throw new Error(`This photo is too old. Only photos taken within the last ${maxAge} can be posted.`);
  }
  if (ageSeconds < -PHOTOSTREAM_CAPTURE_FUTURE_TOLERANCE_SECONDS) {
    throw new Error("This photo's capture date is in the future. Check the clock on your camera.");
  }
}
