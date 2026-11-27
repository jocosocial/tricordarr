/** Height of a post's image gallery. */
export const GALLERY_HEIGHT = 200;

/** Width over height of the row for a post image shown on its own line. */
export const POST_IMAGE_ASPECT_RATIO = 4 / 3;

/** Smallest side of an image's cell, so extreme shapes can still be tapped. */
const MIN_CELL_SIDE = 44;

export interface ImageSize {
  width: number;
  height: number;
}

/**
 * Sizes a cell to fit its image without cropping or bars: as wide as the image needs at the row's
 * height, but no wider than the row. An image whose size is not known yet gets a square cell.
 */
export const getImageCellSize = (image: ImageSize | undefined, row: ImageSize): ImageSize => {
  if (!image || image.width <= 0 || image.height <= 0) {
    return {width: Math.min(row.height, row.width), height: row.height};
  }
  const ratio = image.width / image.height;
  const width = Math.min(Math.max(ratio * row.height, MIN_CELL_SIDE), row.width);
  return {width, height: Math.min(Math.max(width / ratio, MIN_CELL_SIDE), row.height)};
};
