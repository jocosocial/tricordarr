import {
  imageUploadDataFromFilename,
  PRIVATE_EVENT_MAX_IMAGES,
  toSingleImageUploadPayload,
} from '#src/Libraries/ImageUpload';

describe('imageUploadDataFromFilename', () => {
  it('maps a filename to ImageUploadData for edit forms', () => {
    expect(imageUploadDataFromFilename('one.jpg')).toEqual([{filename: 'one.jpg'}]);
  });

  it('returns an empty array when the event has no image', () => {
    expect(imageUploadDataFromFilename(undefined)).toEqual([]);
  });
});

describe('toSingleImageUploadPayload', () => {
  it('strips client-only camera-roll flags before sending to the API', () => {
    expect(toSingleImageUploadPayload([{image: 'base64data', _shouldSaveToRoll: true}])).toEqual({image: 'base64data'});
  });

  it('returns an empty ImageUploadData when clearing the photo', () => {
    expect(toSingleImageUploadPayload([])).toEqual({});
  });

  it('uses the first image only, matching the current single-image API', () => {
    expect(toSingleImageUploadPayload([{filename: 'one.jpg'}, {filename: 'two.jpg'}])).toEqual({filename: 'one.jpg'});
  });

  it('limits private events to one image until Swiftarr issue 521', () => {
    expect(PRIVATE_EVENT_MAX_IMAGES).toBe(1);
  });
});
