import {ImageUploadData} from '#src/Structs/ControllerStructs';

/**
 * Private events currently accept one image, matching the existing API.
 * This may change to forum-post limits (including Shutternaut) once
 * https://github.com/jocosocial/swiftarr/issues/521 is implemented.
 */
export const PRIVATE_EVENT_MAX_IMAGES = 1;

/**
 * Map a server image filename onto `ImageUploadData` for edit forms.
 * Existing images are referenced by filename so they are not re-uploaded.
 */
export const imageUploadDataFromFilename = (filename?: string): ImageUploadData[] => {
  return filename ? [{filename}] : [];
};

/**
 * Strip client-only flags before sending a single image to the API.
 * `_shouldSaveToRoll` is used locally to decide camera-roll autosave.
 * Returns `{}` when there is no image so an edit can clear the attached photo.
 */
export const toSingleImageUploadPayload = (images: ImageUploadData[]): ImageUploadData => {
  const first = images[0];
  if (!first) {
    return {};
  }
  const payload: ImageUploadData = {};
  if (first.filename) {
    payload.filename = first.filename;
  }
  if (first.image) {
    payload.image = first.image;
  }
  return payload;
};
