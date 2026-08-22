import {Image, Options} from 'react-native-image-crop-picker';

/**
 * Helpers for comparing picked images against the server `maxImageSize` limit
 * and for building picker compress options.
 */

/**
 * Decode the byte length of a base64 payload. Used to compare against `maxImageSize`,
 * which is the decoded image size the server enforces, not the encoded JSON length.
 *
 * @param base64 The base64-encoded image data, with or without padding.
 * @returns The decoded size in bytes.
 */
export const getBase64DecodedSize = (base64: string): number => {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return (base64.length * 3) / 4 - padding;
};

/**
 * Resolve the on-disk (or decoded) byte size of a crop-picker image.
 * Prefers `image.size` when the picker reports it; otherwise decodes `image.data`.
 *
 * @param image The image returned by `openPicker` / `openCamera`.
 * @returns The image size in bytes, or 0 if neither size nor data is available.
 */
export const getImageByteSize = (image: Image): number => {
  if (typeof image.size === 'number' && image.size > 0) {
    return image.size;
  }
  if (image.data) {
    return getBase64DecodedSize(image.data);
  }
  return 0;
};

/**
 * Format a byte count for display in error messages (MB / KB / bytes).
 *
 * @param bytes The size in bytes.
 * @returns A short human-readable size string such as `"20 MB"` or `"512 KB"`.
 */
export const formatByteSize = (bytes: number): string => {
  const mib = 1024 * 1024;
  if (bytes >= mib) {
    const value = bytes / mib;
    return `${Number.isInteger(value) ? value : value.toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${bytes} bytes`;
};

/**
 * Build the snackbar message shown when a picked image exceeds the server limit.
 *
 * @param maxImageSize The server `maxImageSize` limit in bytes.
 * @returns An error message that includes the formatted limit.
 */
export const getOversizeImageErrorMessage = (maxImageSize: number): string => {
  return `This image is larger than the server limit of ${formatByteSize(maxImageSize)}.`;
};

/**
 * Whether an image's decoded size meets or exceeds the server limit.
 * The server rejects with a strict `<` check, so equality also fails.
 *
 * @param byteSize The image size in bytes.
 * @param maxImageSize The server `maxImageSize` limit in bytes.
 * @returns True if the image is too large to upload.
 */
export const isImageOversize = (byteSize: number, maxImageSize: number): boolean => {
  return byteSize >= maxImageSize;
};

/**
 * Picker compress options applied at pick time when auto-compress is on.
 * Downscaling during pick avoids loading a full-resolution camera image into memory
 * (the Android 200MP failure mode) before we can check `maxImageSize`.
 *
 * @param autoCompress Whether oversized images should be downscaled at pick time.
 * @param maxDimension Max width and height passed to the picker (not a square crop).
 * @returns Compress options when auto-compress is on, otherwise an empty object.
 */
export const getImageCompressPickerOptions = (autoCompress: boolean, maxDimension: number): Partial<Options> => {
  if (!autoCompress) {
    return {};
  }
  return {
    compressImageMaxWidth: maxDimension,
    compressImageMaxHeight: maxDimension,
    compressImageQuality: 0.8,
  };
};

/**
 * Throw if a picked image is at or over the server size limit.
 *
 * @param image The image returned by the picker.
 * @param maxImageSize The server `maxImageSize` limit in bytes.
 * @throws {Error} When the image is oversized.
 */
export const assertImageWithinSizeLimit = (image: Image, maxImageSize: number): void => {
  if (isImageOversize(getImageByteSize(image), maxImageSize)) {
    throw new Error(getOversizeImageErrorMessage(maxImageSize));
  }
};

/**
 * Throw if base64 image data is at or over the server size limit.
 * Used after photostream crop/blur, when the upload payload is a base64 string.
 *
 * @param base64 The base64-encoded image data.
 * @param maxImageSize The server `maxImageSize` limit in bytes.
 * @throws {Error} When the decoded image is oversized.
 */
export const assertBase64WithinSizeLimit = (base64: string, maxImageSize: number): void => {
  if (isImageOversize(getBase64DecodedSize(base64), maxImageSize)) {
    throw new Error(getOversizeImageErrorMessage(maxImageSize));
  }
};
