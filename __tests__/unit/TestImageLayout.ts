import {getGalleryLayout, getRowImageSizes} from '#src/Libraries/ImageLayout';

describe('getGalleryLayout', () => {
  it('gives a single image its own row', () => {
    expect(getGalleryLayout(1)).toEqual({rows: [[0]], rowAspectRatio: 4 / 3});
  });

  it('puts two images side by side', () => {
    expect(getGalleryLayout(2)).toEqual({rows: [[0, 1]], rowAspectRatio: 2});
  });

  it('puts the third image alone on the second row', () => {
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

describe('getRowImageSizes', () => {
  const row = {width: 404, height: 200};
  const gap = 4;
  const portrait = {width: 600, height: 800};
  const landscape = {width: 800, height: 600};

  it('narrows portrait images to their own shape', () => {
    expect(getRowImageSizes([portrait, portrait], row, gap)).toEqual([
      {width: 150, height: 200},
      {width: 150, height: 200},
    ]);
  });

  it('gives a landscape image the width its portrait neighbor does not need', () => {
    const [first, second] = getRowImageSizes([portrait, landscape], row, gap);
    expect(first).toEqual({width: 150, height: 200});
    expect(second).toEqual({width: 250, height: 187.5});
  });

  it('shrinks two landscape images equally', () => {
    expect(getRowImageSizes([landscape, landscape], row, gap)).toEqual([
      {width: 200, height: 150},
      {width: 200, height: 150},
    ]);
  });

  it('gives unknown images an equal share at full height', () => {
    expect(getRowImageSizes([undefined, portrait], row, gap)).toEqual([
      {width: 200, height: 200},
      {width: 150, height: 200},
    ]);
  });

  it('never exceeds the row or drops below a tappable size', () => {
    expect(getRowImageSizes([{width: 1000, height: 100}], row, gap)).toEqual([{width: 404, height: 44}]);
    expect(getRowImageSizes([{width: 100, height: 1000}], row, gap)).toEqual([{width: 44, height: 200}]);
  });
});
