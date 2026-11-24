import {getImageCellSize} from '#src/Libraries/ImageLayout';

describe('getImageCellSize', () => {
  const row = {width: 400, height: 300};

  it('narrows a portrait image to its own shape', () => {
    expect(getImageCellSize({width: 600, height: 800}, row)).toEqual({width: 225, height: 300});
  });

  it('shrinks an image that would be wider than the row', () => {
    expect(getImageCellSize({width: 1600, height: 800}, row)).toEqual({width: 400, height: 200});
  });

  it('gives an unknown image a square cell', () => {
    expect(getImageCellSize(undefined, row)).toEqual({width: 300, height: 300});
    expect(getImageCellSize({width: 0, height: 0}, row)).toEqual({width: 300, height: 300});
  });

  it('never exceeds the row or drops below a tappable size', () => {
    expect(getImageCellSize({width: 1000, height: 100}, row)).toEqual({width: 400, height: 44});
    expect(getImageCellSize({width: 100, height: 1000}, row)).toEqual({width: 44, height: 300});
  });
});
