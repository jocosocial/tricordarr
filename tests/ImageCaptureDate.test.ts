import type {Image} from 'react-native-image-crop-picker';

import {
  assertPhotostreamCaptureDateAllowed,
  getImageCaptureDate,
  parseExifDateTime,
  PHOTOSTREAM_CAPTURE_FUTURE_TOLERANCE_SECONDS,
  PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS,
} from '#src/Libraries/ImageCaptureDate';

const baseImage: Image = {path: '/tmp/x.jpg', size: 1, width: 1, height: 1, mime: 'image/jpeg'};

describe('parseExifDateTime', () => {
  it('parses an EXIF date as local time', () => {
    expect(parseExifDateTime('2026:11:02 13:45:10')).toEqual(new Date(2026, 10, 2, 13, 45, 10));
  });

  it('rejects malformed or missing values', () => {
    expect(parseExifDateTime(undefined)).toBeUndefined();
    expect(parseExifDateTime(null)).toBeUndefined();
    expect(parseExifDateTime('')).toBeUndefined();
    expect(parseExifDateTime('0000:00:00 00:00:00')).toBeUndefined();
    expect(parseExifDateTime('2026:02:31 10:00:00')).toBeUndefined();
    expect(parseExifDateTime('not a date')).toBeUndefined();
  });
});

describe('getImageCaptureDate', () => {
  it('prefers the iOS creationDate', () => {
    const image = {
      ...baseImage,
      creationDate: '1793630000',
      exif: {'{Exif}': {DateTimeOriginal: '2020:01:01 00:00:00'}},
    };
    expect(getImageCaptureDate(image)).toEqual(new Date(1793630000 * 1000));
  });

  it('reads the iOS nested {Exif} dictionary', () => {
    const image = {...baseImage, exif: {'{Exif}': {DateTimeOriginal: '2026:11:02 10:00:00'}}};
    expect(getImageCaptureDate(image)).toEqual(new Date(2026, 10, 2, 10, 0, 0));
  });

  it('reads Android flat EXIF keys, preferring DateTimeDigitized over DateTime', () => {
    const image = {...baseImage, exif: {DateTime: '2026:11:02 12:00:00', DateTimeDigitized: '2026:11:02 11:00:00'}};
    expect(getImageCaptureDate(image)).toEqual(new Date(2026, 10, 2, 11, 0, 0));
    expect(getImageCaptureDate({...baseImage, exif: {DateTime: '2026:11:02 12:00:00'}})).toEqual(
      new Date(2026, 10, 2, 12, 0, 0),
    );
  });

  it('ignores modificationDate', () => {
    expect(getImageCaptureDate({...baseImage, modificationDate: String(Date.now())})).toBeUndefined();
    expect(getImageCaptureDate({...baseImage, exif: {DateTime: null}})).toBeUndefined();
  });
});

describe('assertPhotostreamCaptureDateAllowed', () => {
  const now = new Date(2026, 10, 2, 12, 0, 0);
  const secondsAgo = (s: number) => new Date(now.getTime() - s * 1000);

  it('allows photos up to the maximum age', () => {
    expect(() => assertPhotostreamCaptureDateAllowed(now, now)).not.toThrow();
    expect(() =>
      assertPhotostreamCaptureDateAllowed(secondsAgo(PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS), now),
    ).not.toThrow();
  });

  it('rejects photos older than the maximum age', () => {
    expect(() => assertPhotostreamCaptureDateAllowed(secondsAgo(PHOTOSTREAM_MAX_CAPTURE_AGE_SECONDS + 1), now)).toThrow(
      /too old.*2 hours/,
    );
  });

  it('tolerates small future skew but rejects larger', () => {
    expect(() => assertPhotostreamCaptureDateAllowed(secondsAgo(-60), now)).not.toThrow();
    expect(() =>
      assertPhotostreamCaptureDateAllowed(secondsAgo(-PHOTOSTREAM_CAPTURE_FUTURE_TOLERANCE_SECONDS - 1), now),
    ).toThrow(/future/);
  });

  it('rejects an unknown capture date', () => {
    expect(() => assertPhotostreamCaptureDateAllowed(undefined, now)).toThrow(/Could not determine/);
    expect(() => assertPhotostreamCaptureDateAllowed(new Date(NaN), now)).toThrow(/Could not determine/);
  });
});
