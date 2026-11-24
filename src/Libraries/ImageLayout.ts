/** Width over height of the row for a post image shown on its own line. */
export const POST_IMAGE_ASPECT_RATIO = 4 / 3;

/** Width over height of a gallery row holding two images, or the last of an odd number. */
export const GALLERY_ROW_ASPECT_RATIO = 2;

const GALLERY_COLUMNS = 2;

/** Smallest side of an image's cell, so extreme shapes can still be tapped. */
const MIN_CELL_SIDE = 44;

export interface ImageSize {
  width: number;
  height: number;
}

export interface GalleryLayout {
  /** Image indexes in each row. */
  rows: number[][];
  rowAspectRatio: number;
}

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

/**
 * Sizes the cells of one row so each fits its image without cropping or bars. An image takes the width
 * it needs at the row's height; if they do not all fit, the widest ones shrink. An image whose size is
 * not known yet wants an equal share of the row at full height.
 */
export const getRowImageSizes = (images: (ImageSize | undefined)[], row: ImageSize, gap: number): ImageSize[] => {
  const available = Math.max(row.width - gap * (images.length - 1), 0);
  const ratios = images.map(image =>
    image && image.width > 0 && image.height > 0 ? image.width / image.height : undefined,
  );
  const wanted = ratios.map(ratio =>
    ratio === undefined ? available / images.length : Math.max(ratio * row.height, MIN_CELL_SIDE),
  );

  // Narrowest first, so width they do not need goes to the wider ones.
  const order = wanted.map((_, index) => index).sort((a, b) => wanted[a] - wanted[b]);
  const widths: number[] = [];
  let remaining = available;
  order.forEach((index, position) => {
    const width = Math.min(wanted[index], remaining / (order.length - position));
    widths[index] = width;
    remaining -= width;
  });

  return ratios.map((ratio, index) => ({
    width: widths[index],
    height: ratio === undefined ? row.height : Math.min(row.height, Math.max(widths[index] / ratio, MIN_CELL_SIDE)),
  }));
};
