import {getBase64FromDataURI} from '#src/Libraries/ImageSize';

describe('getBase64FromDataURI', () => {
  it('strips the data URI prefix', () => {
    expect(getBase64FromDataURI('data:image/jpeg;base64,/9j/4AAQ')).toBe('/9j/4AAQ');
    expect(getBase64FromDataURI('data:image/png;base64,iVBORw0KGgo=')).toBe('iVBORw0KGgo=');
  });

  it('removes the line breaks iOS inserts into the payload', () => {
    expect(getBase64FromDataURI('data:image/jpeg;base64,AAAA\r\nBBBB\nCC==')).toBe('AAAABBBBCC==');
  });

  it('passes bare base64 through', () => {
    expect(getBase64FromDataURI('AAAA\nBBBB')).toBe('AAAABBBB');
  });

  it('returns undefined when there is no image', () => {
    expect(getBase64FromDataURI(undefined)).toBeUndefined();
    expect(getBase64FromDataURI(null)).toBeUndefined();
    expect(getBase64FromDataURI('')).toBeUndefined();
    expect(getBase64FromDataURI('data:image/png;base64,')).toBeUndefined();
  });
});
