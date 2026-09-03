import {getDownloadFileExtension, getDownloadFileName, getDownloadSheetTitle} from '#src/Libraries/Download';

describe('getDownloadFileExtension', () => {
  it('maps mime types to file extensions', () => {
    expect(getDownloadFileExtension('text/csv')).toBe('csv');
    expect(getDownloadFileExtension('text/calendar')).toBe('ics');
    expect(getDownloadFileExtension('text/plain')).toBe('txt');
  });

  it('falls back to txt for unknown mime types', () => {
    expect(getDownloadFileExtension('application/octet-stream')).toBe('txt');
  });
});

describe('getDownloadFileName', () => {
  it('appends the mime extension to the basename', () => {
    expect(
      getDownloadFileName({
        baseName: 'event_feedback_reports',
        mimeType: 'text/csv',
        contents: '',
      }),
    ).toBe('event_feedback_reports.csv');
    expect(
      getDownloadFileName({
        baseName: 'calendarevent',
        mimeType: 'text/calendar',
        contents: '',
      }),
    ).toBe('calendarevent.ics');
  });
});

describe('getDownloadSheetTitle', () => {
  it('uses the content title when provided', () => {
    expect(
      getDownloadSheetTitle({
        title: 'Download Logs',
        baseName: 'logs',
        mimeType: 'text/plain',
        contents: '',
      }),
    ).toBe('Download Logs');
  });

  it('falls back to Download when title is missing', () => {
    expect(getDownloadSheetTitle()).toBe('Download');
    expect(
      getDownloadSheetTitle({
        baseName: 'file',
        mimeType: 'text/plain',
        contents: '',
      }),
    ).toBe('Download');
  });
});
