import {getFittedImageSize, getGalleryLayout} from '#src/Libraries/ImageLayout';

describe('getFittedImageSize', () => {
  it('fits a tall image to the frame height', () => {
    expect(getFittedImageSize({width: 900, height: 1600}, {width: 400, height: 320})).toEqual({
      width: 180,
      height: 320,
    });
  });

  it('fits a wide image to the frame width', () => {
    expect(getFittedImageSize({width: 2000, height: 500}, {width: 400, height: 300})).toEqual({
      width: 400,
      height: 100,
    });
  });

  it('falls back to the frame when the image size is unusable', () => {
    expect(getFittedImageSize({width: 0, height: 0}, {width: 400, height: 300})).toEqual({width: 400, height: 300});
  });
});

describe('getGalleryLayout', () => {
  it('gives a single image its own frame', () => {
    expect(getGalleryLayout(1)).toEqual({rows: [[0]], rowAspectRatio: 4 / 3});
  });

  it('puts two images side by side', () => {
    expect(getGalleryLayout(2)).toEqual({rows: [[0, 1]], rowAspectRatio: 2});
  });

  it('spans the third image across the second row', () => {
    expect(getGalleryLayout(3).rows).toEqual([[0, 1], [2]]);
  });

  it('puts four images in two rows', () => {
    expect(getGalleryLayout(4)).toEqual({
      rows: [
        [0, 1],
        [2, 3],
      ],
      rowAspectRatio: 2,
    });
  });

  it('shows every image of a full post', () => {
    expect(getGalleryLayout(8).rows).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
    ]);
  });
});
