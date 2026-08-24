import {ImageUploadData} from '#src/Structs/ControllerStructs';

/**
 * Map server image filenames onto `ImageUploadData` for edit forms.
 * Existing images are referenced by filename so they are not re-uploaded.
 */
export const imageUploadDataFromFilenames = (filenames?: string[]): ImageUploadData[] => {
  return filenames?.map(filename => ({filename})) ?? [];
};

/**
 * Strip client-only flags before sending images to the API.
 * `_shouldSaveToRoll` is used locally to decide camera-roll autosave.
 */
export const toImageUploadPayload = (images: ImageUploadData[]): ImageUploadData[] => {
  return images.map(({filename, image}) => {
    const payload: ImageUploadData = {};
    if (filename) {
      payload.filename = filename;
    }
    if (image) {
      payload.image = image;
    }
    return payload;
  });
};
