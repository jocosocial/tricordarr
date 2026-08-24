import {
  DEFAULT_MAX_FORUM_POST_IMAGES,
  SHUTTERNAUT_MAX_FORUM_POST_IMAGES,
} from '#src/Context/Contexts/ClientSettingsContext';
import {imageUploadDataFromFilenames, toImageUploadPayload} from '#src/Libraries/ImageUpload';

describe('imageUploadDataFromFilenames', () => {
  it('maps filenames to ImageUploadData for edit forms', () => {
    expect(imageUploadDataFromFilenames(['one.jpg', 'two.jpg'])).toEqual([
      {filename: 'one.jpg'},
      {filename: 'two.jpg'},
    ]);
  });

  it('returns an empty array when the event has no images', () => {
    expect(imageUploadDataFromFilenames(undefined)).toEqual([]);
    expect(imageUploadDataFromFilenames([])).toEqual([]);
  });
});

describe('toImageUploadPayload', () => {
  it('strips client-only camera-roll flags before sending to the API', () => {
    expect(
      toImageUploadPayload([
        {image: 'base64data', _shouldSaveToRoll: true},
        {filename: 'existing.jpg', _shouldSaveToRoll: false},
      ]),
    ).toEqual([{image: 'base64data'}, {filename: 'existing.jpg'}]);
  });

  it('matches forum post image limits used by private events', () => {
    expect(DEFAULT_MAX_FORUM_POST_IMAGES).toBe(4);
    expect(SHUTTERNAUT_MAX_FORUM_POST_IMAGES).toBe(8);
  });
});
