import {BUTTON_SCROLL_MAX_RETRIES, BUTTON_SCROLL_WINDOW_MS} from '#src/Libraries/ChatList/Constants';
import {
  createButtonScrollTarget,
  getButtonRetryAction,
  getScrollButtonDirection,
  getSecondaryEdge,
  hasReachedButtonEdge,
  isAtTop,
} from '#src/Libraries/ChatList/ScrollButtons';

const THRESHOLD = 100;
// Viewport 0..500 of 2000 content: 1500 from the bottom.
const metrics = {offset: 0, viewportHeight: 500, contentHeight: 2000};

describe('getScrollButtonDirection', () => {
  it('is hidden before the first scroll event and near the bottom', () => {
    expect(getScrollButtonDirection(null, THRESHOLD)).toBeNull();
    expect(getScrollButtonDirection({...metrics, offset: 1450}, THRESHOLD)).toBeNull();
  });

  it('points down without a divider', () => {
    expect(getScrollButtonDirection(metrics, THRESHOLD)).toBe('down');
  });

  it('points toward a divider outside the threshold', () => {
    expect(getScrollButtonDirection({...metrics, offset: 1000}, THRESHOLD, {top: 200, bottom: 240})).toBe('up');
    expect(getScrollButtonDirection(metrics, THRESHOLD, {top: 900, bottom: 940})).toBe('down');
  });

  it('is hidden when the divider is in or near the viewport', () => {
    expect(getScrollButtonDirection(metrics, THRESHOLD, {top: 300, bottom: 340})).toBeNull();
    expect(getScrollButtonDirection(metrics, THRESHOLD, {top: 560, bottom: 600})).toBeNull();
    expect(getScrollButtonDirection({...metrics, offset: 1000}, THRESHOLD, {top: 860, bottom: 920})).toBeNull();
  });
});

describe('isAtTop', () => {
  it('is only true at the real beginning', () => {
    expect(isAtTop(4, false, 8)).toBe(true);
    expect(isAtTop(4, true, 8)).toBe(false);
    expect(isAtTop(20, false, 8)).toBe(false);
  });
});

describe('hasReachedButtonEdge', () => {
  it('checks the top against the margin and the end against the epsilon', () => {
    expect(hasReachedButtonEdge('top', 8, 1000, 8)).toBe(true);
    expect(hasReachedButtonEdge('top', 9, 1000, 8)).toBe(false);
    expect(hasReachedButtonEdge('end', 500, 40, 8)).toBe(true);
    expect(hasReachedButtonEdge('end', 500, 200, 8)).toBe(false);
  });
});

describe('getButtonRetryAction', () => {
  it('retries within the window and retry budget', () => {
    const target = createButtonScrollTarget('end', 1000);
    expect(getButtonRetryAction(target, 1000 + BUTTON_SCROLL_WINDOW_MS)).toBe('retry');
  });

  it('clears after the window', () => {
    const target = createButtonScrollTarget('end', 1000);
    expect(getButtonRetryAction(target, 1001 + BUTTON_SCROLL_WINDOW_MS)).toBe('clear');
  });

  it('clears once the retries are used up', () => {
    const target = {...createButtonScrollTarget('top', 1000), retries: BUTTON_SCROLL_MAX_RETRIES};
    expect(getButtonRetryAction(target, 1000)).toBe('clear');
  });
});

describe('getSecondaryEdge', () => {
  it('is opposite the primary direction', () => {
    expect(getSecondaryEdge('up')).toBe('end');
    expect(getSecondaryEdge('down')).toBe('top');
    expect(getSecondaryEdge(null)).toBe('top');
  });
});
