import {
  AnchorError,
  computeAnchorError,
  computeEndOffset,
  initialReadyCheckState,
  ReadyCheckState,
  ReadyCheckStep,
  resolveAnchorIndex,
  stepReadyCheck,
} from '#src/Libraries/ChatList/Anchor';
import {
  ANCHOR_CORRECTION_START_FRAME,
  ANCHOR_CORRECTION_WAIT_FRAMES,
  ANCHOR_MAX_CORRECTIONS,
  ANCHOR_SETTLED_FRAMES,
  READY_WATCHDOG_FRAMES,
  READY_WATCHDOG_MS,
} from '#src/Libraries/ChatList/Constants';

/** Guard on ticks per run, past the watchdog. */
const MAX_TICKS = READY_WATCHDOG_FRAMES * 4;

/**
 * Ticks the ready check until it reports ready (or MAX_TICKS as a guard), feeding
 * each measurement from `measureAt(frame)`. Frames are `frameMs` apart (16ms, 60Hz, by default).
 * Returns every step, so tests can see when it measured, corrected, and revealed.
 */
const run = (measureAt: (frame: number) => AnchorError | undefined, frameMs = 16) => {
  const steps: (ReadyCheckStep & {measured: boolean})[] = [];
  let state: ReadyCheckState = initialReadyCheckState;
  for (let i = 0; i < MAX_TICKS; i++) {
    let measured = false;
    const step = stepReadyCheck(
      state,
      () => {
        measured = true;
        return measureAt(state.frames + 1);
      },
      state.frames * frameMs,
    );
    steps.push({...step, measured});
    state = step.state;
    if (step.ready) {
      break;
    }
  }
  return steps;
};

describe('computeEndOffset', () => {
  it('is the content less the window, never negative', () => {
    expect(computeEndOffset(1000, 50, 400)).toBe(650);
    expect(computeEndOffset(100, 50, 400)).toBe(0);
  });
});

describe('computeAnchorError', () => {
  it('targets the end offset for an end anchor', () => {
    expect(computeAnchorError({offset: 600, endOffset: 650, firstItemOffset: 50, margin: 8})).toEqual({
      error: -50,
      target: 650,
    });
  });

  it('targets the item a margin below the top edge, header included', () => {
    expect(computeAnchorError({offset: 300, endOffset: 650, itemY: 200, firstItemOffset: 50, margin: 8})).toEqual({
      error: 58,
      target: 242,
    });
  });

  it('clamps an index target to the end offset', () => {
    expect(computeAnchorError({offset: 650, endOffset: 650, itemY: 900, firstItemOffset: 50, margin: 8}).target).toBe(
      650,
    );
  });
});

describe('resolveAnchorIndex', () => {
  const key = (item: {id: string}) => item.id;

  it('follows the anchor key after a prepend', () => {
    const data = [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}];
    expect(resolveAnchorIndex(data, key, 'c', 0)).toBe(2);
  });

  it('falls back when there is no key or the key is gone', () => {
    const data = [{id: 'a'}];
    expect(resolveAnchorIndex(data, key, undefined, 3)).toBe(3);
    expect(resolveAnchorIndex(data, key, 'z', 3)).toBe(3);
  });
});

describe('stepReadyCheck', () => {
  it('does not measure before FlashList has had its initial scroll window', () => {
    const steps = run(() => ({error: 0, target: 0}));
    const firstMeasured = steps.findIndex(step => step.measured) + 1;
    expect(firstMeasured).toBe(ANCHOR_CORRECTION_START_FRAME);
  });

  it('is ready after enough consecutive in-tolerance frames', () => {
    const steps = run(() => ({error: 3, target: 100}));
    expect(steps.length).toBe(ANCHOR_CORRECTION_START_FRAME + ANCHOR_SETTLED_FRAMES - 1);
    expect(steps.every(step => step.scrollTo === undefined)).toBe(true);
  });

  it('corrects toward the target, then waits for the scroll to land before measuring', () => {
    const steps = run(() => ({error: 200, target: 400}));
    const correction = steps.find(step => step.scrollTo !== undefined);
    expect(correction?.scrollTo).toBe(400);
    expect(correction?.state.corrections).toBe(1);
    let state = correction!.state;
    const measured: boolean[] = [];
    for (let i = 0; i < ANCHOR_CORRECTION_WAIT_FRAMES; i++) {
      let didMeasure = false;
      state = stepReadyCheck(
        state,
        () => {
          didMeasure = true;
          return {error: 0, target: 400};
        },
        0,
      ).state;
      measured.push(didMeasure);
    }
    expect(measured).toEqual([false, false, true]);
  });

  it('gives up waiting when a correction did not change the error', () => {
    const steps = run(() => ({error: 200, target: 400}));
    const corrections = steps.filter(step => step.scrollTo !== undefined).length;
    expect(corrections).toBe(1);
    expect(steps[steps.length - 1].ready).toBe(true);
    expect(steps.length).toBeLessThan(MAX_TICKS);
  });

  it('caps corrections when the error keeps moving', () => {
    let error = 100;
    const steps = run(() => {
      error += 100;
      return {error, target: 0};
    });
    expect(steps.filter(step => step.scrollTo !== undefined).length).toBe(ANCHOR_MAX_CORRECTIONS);
    expect(steps[steps.length - 1].watchdog).toBe(true);
  });

  it('the watchdog reveals once both floors are met (about 750ms at 60Hz)', () => {
    const frameMs = 1000 / 60;
    const steps = run(() => undefined, frameMs);
    expect(steps.length).toBe(Math.max(READY_WATCHDOG_FRAMES, Math.ceil(READY_WATCHDOG_MS / frameMs) + 1));
    expect(steps[steps.length - 1]).toMatchObject({ready: true, watchdog: true});
  });

  it('the watchdog waits for READY_WATCHDOG_MS on a fast display', () => {
    const frameMs = 1000 / 120;
    const steps = run(() => undefined, frameMs);
    expect(steps.length).toBe(Math.ceil(READY_WATCHDOG_MS / frameMs) + 1);
    expect(steps[steps.length - 2].ready).toBe(false);
  });

  it('the watchdog waits for READY_WATCHDOG_FRAMES when frames are slow (busy JS thread)', () => {
    const steps = run(() => undefined, 500);
    expect(steps.length).toBe(READY_WATCHDOG_FRAMES);
  });

  it('a settled anchor is not a watchdog reveal', () => {
    const steps = run(() => ({error: 0, target: 0}));
    expect(steps[steps.length - 1]).toMatchObject({ready: true, watchdog: false});
  });

  it('resets the settled count when the anchor drifts out of tolerance', () => {
    const errors = [0, 50, 0, 0];
    let call = 0;
    const steps = run(() => ({error: errors[Math.min(call++, errors.length - 1)], target: 0}));
    const correction = steps.find(step => step.scrollTo !== undefined);
    expect(correction?.state.settledFrames).toBe(0);
  });
});
