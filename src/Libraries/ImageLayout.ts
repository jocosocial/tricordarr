/** Where a whole image sits within a frame that does not share its shape. */
export type ImageFrameAlign = 'center' | 'start' | 'end';

/** Width over height of the frame around a post image shown on its own line. */
export const POST_IMAGE_ASPECT_RATIO = 4 / 3;

/** Width over height of a gallery row: two square tiles, or one image spanning both. */
export const GALLERY_ROW_ASPECT_RATIO = 2;

const GALLERY_COLUMNS = 2;

interface Size {
  width: number;
  height: number;
}

export interface GalleryLayout {
  /** Image indexes in each row. */
  rows: number[][];
  rowAspectRatio: number;
}

/** Largest size with the image's shape that fits inside the frame. */
export const getFittedImageSize = (image: Size, frame: Size): Size => {
  if (image.width <= 0 || image.height <= 0) {
    return frame;
  }
  const scale = Math.min(frame.width / image.width, frame.height / image.height);
  return {width: image.width * scale, height: image.height * scale};
};

/**
 * Arranges a post's images into gallery rows, showing all of them. Depends only on how many there are, so
 * the gallery's height is known before any image loads.
 */
export const getGalleryLayout = (imageCount: number): GalleryLayout => {
  const rows: number[][] = [];
  for (let start = 0; start < imageCount; start += GALLERY_COLUMNS) {
    const length = Math.min(GALLERY_COLUMNS, imageCount - start);
    rows.push(Array.from({length}, (_, offset) => start + offset));
  }
  return {
    rows,
    rowAspectRatio: imageCount === 1 ? POST_IMAGE_ASPECT_RATIO : GALLERY_ROW_ASPECT_RATIO,
  };
};
