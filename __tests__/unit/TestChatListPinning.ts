import {FLING_AFTER_DRAG_MS} from '#src/Libraries/ChatList/Constants';
import {
  hasOutgrownViewport,
  isUserFling,
  shouldPinAfterKeyboard,
  shouldRepinOnContentGrowth,
  shouldRepinOnResize,
} from '#src/Libraries/ChatList/Pinning';

describe('shouldRepinOnContentGrowth', () => {
  // At the end: 1500 - 500 - 1000 = 0 from the bottom.
  const base = {
    metrics: {offset: 1000, viewportHeight: 500, contentHeight: 1500},
    contentHeight: 1800,
    now: 1000,
    endPinUntil: 2000,
    userScrolling: false,
  };

  it('re-pins growth at the end inside the window', () => {
    expect(shouldRepinOnContentGrowth(base)).toBe(true);
  });

  it('does not re-pin away from the end, on shrink, after the window, or while the user scrolls', () => {
    expect(shouldRepinOnContentGrowth({...base, metrics: {...base.metrics, offset: 800}})).toBe(false);
    expect(shouldRepinOnContentGrowth({...base, contentHeight: 1400})).toBe(false);
    expect(shouldRepinOnContentGrowth({...base, now: 2000})).toBe(false);
    expect(shouldRepinOnContentGrowth({...base, userScrolling: true})).toBe(false);
  });
});

describe('hasOutgrownViewport', () => {
  it('needs a pending pin, a measured viewport, and content past it', () => {
    expect(hasOutgrownViewport(true, 500, 502)).toBe(true);
    expect(hasOutgrownViewport(true, 500, 501)).toBe(false);
    expect(hasOutgrownViewport(false, 500, 900)).toBe(false);
    expect(hasOutgrownViewport(true, null, 900)).toBe(false);
  });
});

describe('shouldRepinOnResize', () => {
  const base = {
    previousHeight: 600,
    height: 400,
    ready: true,
    userScrolling: false,
    nearBottom: true,
    keyboardPinned: false,
  };

  it('re-pins a real resize while near the bottom', () => {
    expect(shouldRepinOnResize(base)).toBe(true);
    expect(shouldRepinOnResize({...base, nearBottom: false, keyboardPinned: true})).toBe(true);
  });

  it('ignores the first layout, no change, before ready, while scrolling, and away from the bottom', () => {
    expect(shouldRepinOnResize({...base, previousHeight: null})).toBe(false);
    expect(shouldRepinOnResize({...base, height: 600})).toBe(false);
    expect(shouldRepinOnResize({...base, ready: false})).toBe(false);
    expect(shouldRepinOnResize({...base, userScrolling: true})).toBe(false);
    expect(shouldRepinOnResize({...base, nearBottom: false})).toBe(false);
  });
});

describe('shouldPinAfterKeyboard', () => {
  const base = {userScrolling: false, keyboardPinned: false, ready: true, nearBottom: true};

  it('pins from the Will snapshot or from near-bottom at the Did event', () => {
    expect(shouldPinAfterKeyboard(base)).toBe(true);
    expect(shouldPinAfterKeyboard({...base, nearBottom: false, keyboardPinned: true})).toBe(true);
  });

  it('does not pin while scrolling, or near the bottom before ready', () => {
    expect(shouldPinAfterKeyboard({...base, userScrolling: true, keyboardPinned: true})).toBe(false);
    expect(shouldPinAfterKeyboard({...base, ready: false})).toBe(false);
  });
});

describe('isUserFling', () => {
  it('counts momentum right after a drag as the user', () => {
    expect(isUserFling(1000 + FLING_AFTER_DRAG_MS, 1000)).toBe(true);
    expect(isUserFling(1001 + FLING_AFTER_DRAG_MS, 1000)).toBe(false);
  });
});
