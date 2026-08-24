import {resolveTextInputAutoCorrect} from '#src/Libraries/Forms/TextInputAutoCorrect';

describe('resolveTextInputAutoCorrect', () => {
  it('disables autocorrect for identifier fields', () => {
    expect(resolveTextInputAutoCorrect('none')).toBe(false);
  });

  it('keeps the platform default for sentence and unset fields', () => {
    expect(resolveTextInputAutoCorrect('sentences')).toBeUndefined();
    expect(resolveTextInputAutoCorrect('words')).toBeUndefined();
    expect(resolveTextInputAutoCorrect(undefined)).toBeUndefined();
  });

  it('honors an explicit override', () => {
    expect(resolveTextInputAutoCorrect('none', true)).toBe(true);
    expect(resolveTextInputAutoCorrect('sentences', false)).toBe(false);
  });
});
