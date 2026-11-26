import {BUTTON_SCROLL_MAX_RETRIES, END_PIN_MS, FLING_AFTER_DRAG_MS} from '#src/Libraries/ChatList/Constants';
import {
  ArbiterEvent,
  initialScrollArbiterState,
  reduceScrollArbiter,
  ScrollArbiterState,
  ScrollCommand,
} from '#src/Libraries/ChatList/ScrollArbiter';

/** Folds events through the reducer, collecting every command issued along the way. */
const run = (events: ArbiterEvent[], from: ScrollArbiterState = initialScrollArbiterState) =>
  events.reduce<{state: ScrollArbiterState; commands: ScrollCommand[]}>(
    (acc, event) => {
      const step = reduceScrollArbiter(acc.state, event);
      return {state: step.state, commands: [...acc.commands, ...step.commands]};
    },
    {state: from, commands: []},
  );

/** Commands from one more event applied to a state. */
const commandsFor = (state: ScrollArbiterState, event: ArbiterEvent) => reduceScrollArbiter(state, event).commands;

const viewport = 500;
const atEnd = {offset: 1000, viewportHeight: viewport, contentHeight: 1500};
const farUp = {offset: 100, viewportHeight: viewport, contentHeight: 1500};
const scroll = (metrics: typeof atEnd): ArbiterEvent => ({type: 'scroll', metrics, threshold: 100, margin: 8});

/** A revealed list, laid out at `viewport` height, sitting at the end. */
const settledAtEnd = run([{type: 'resize', height: viewport}, {type: 'ready'}, scroll(atEnd)]).state;

describe('positioning', () => {
  it('starts positioning and settles on ready', () => {
    expect(initialScrollArbiterState.phase).toBe('positioning');
    expect(run([{type: 'ready'}]).state.phase).toBe('settled');
  });

  it('passes anchor corrections through only while positioning', () => {
    expect(commandsFor(initialScrollArbiterState, {type: 'anchorCorrection', offset: 42})).toEqual([
      {type: 'scrollToOffset', offset: 42, animated: false},
    ]);
    expect(commandsFor(settledAtEnd, {type: 'anchorCorrection', offset: 42})).toEqual([]);
  });

  it('does not re-pin on resize before ready', () => {
    const {commands} = run([
      {type: 'resize', height: viewport},
      {type: 'resize', height: 300},
    ]);
    expect(commands).toEqual([]);
  });
});

describe('resize', () => {
  it('re-pins a following list when its height changes', () => {
    expect(commandsFor(settledAtEnd, {type: 'resize', height: 300})).toEqual([{type: 'repin'}]);
  });

  it('ignores the first layout, an unchanged height, and a list the user scrolled away from', () => {
    expect(run([{type: 'ready'}, {type: 'resize', height: viewport}]).commands).toEqual([]);
    expect(commandsFor(settledAtEnd, {type: 'resize', height: viewport})).toEqual([]);
    const scrolledUp = run([scroll(farUp)], settledAtEnd).state;
    expect(commandsFor(scrolledUp, {type: 'resize', height: 300})).toEqual([]);
  });

  it('does not re-pin while the user drags', () => {
    const dragging = run([{type: 'dragBegin'}], settledAtEnd).state;
    expect(commandsFor(dragging, {type: 'resize', height: 300})).toEqual([]);
  });
});

describe('gestures', () => {
  it('counts momentum right after a drag as the user fling', () => {
    const {state} = run([{type: 'dragBegin'}, {type: 'dragEnd', now: 1000}, {type: 'momentumBegin', now: 1050}]);
    expect(state.gesture).toBe('flinging');
    expect(run([{type: 'momentumEnd', now: 1500}], state).state.gesture).toBe('none');
  });

  it('treats momentum long after a drag as programmatic (Android scrollToEnd)', () => {
    const {state} = run([
      {type: 'dragBegin'},
      {type: 'dragEnd', now: 1000},
      {type: 'momentumBegin', now: 1000 + FLING_AFTER_DRAG_MS + 1},
    ]);
    expect(state.gesture).toBe('none');
  });
});

describe('scroll buttons', () => {
  it('scrolls to the end and opens a button end pin', () => {
    const {state, commands} = run([{type: 'buttonPress', edge: 'end', now: 1000}], settledAtEnd);
    expect(commands).toEqual([{type: 'scrollToEnd', animated: true}]);
    expect(state.endPin).toEqual({reason: 'button', until: 1000 + END_PIN_MS});
    expect(state.buttonTarget?.edge).toBe('end');
  });

  it('scrolls to the top without an end pin', () => {
    const {state, commands} = run([{type: 'buttonPress', edge: 'top', now: 1000}], settledAtEnd);
    expect(commands).toEqual([{type: 'scrollToOffset', offset: 0, animated: true}]);
    expect(state.endPin).toBeNull();
  });

  it('scrolls to the divider', () => {
    expect(commandsFor(settledAtEnd, {type: 'dividerPress', index: 7, viewPosition: 0.1})).toEqual([
      {type: 'scrollToIndex', index: 7, viewPosition: 0.1},
    ]);
  });

  it('re-pins growth at the end inside the button window only', () => {
    const pressed = run([{type: 'buttonPress', edge: 'end', now: 1000}], settledAtEnd).state;
    const grow = (now: number): ArbiterEvent => ({type: 'contentSize', height: 1800, metrics: atEnd, now});
    expect(commandsFor(pressed, grow(1500))).toEqual([{type: 'repin'}]);
    expect(commandsFor(pressed, grow(1000 + END_PIN_MS))).toEqual([]);
  });

  it('resends a scroll cut short, up to the retry budget', () => {
    let state = run([scroll(farUp), {type: 'buttonPress', edge: 'top', now: 1000}], settledAtEnd).state;
    for (let i = 0; i < BUTTON_SCROLL_MAX_RETRIES; i++) {
      const step = reduceScrollArbiter(state, {type: 'momentumEnd', now: 1100});
      expect(step.commands).toEqual([{type: 'scrollToOffset', offset: 0, animated: true}]);
      state = step.state;
    }
    const last = reduceScrollArbiter(state, {type: 'momentumEnd', now: 1100});
    expect(last.commands).toEqual([]);
    expect(last.state.buttonTarget).toBeNull();
  });

  it('clears the target once the edge is reached, or on a touch', () => {
    const pressed = run([scroll(farUp), {type: 'buttonPress', edge: 'top', now: 1000}], settledAtEnd).state;
    const landed = run([scroll({...farUp, offset: 0}), {type: 'momentumEnd', now: 1100}], pressed);
    expect(landed.commands).toEqual([]);
    const touched = run([{type: 'touchStart'}, {type: 'momentumEnd', now: 1100}], pressed);
    expect(touched.commands).toEqual([]);
  });

  it('a drag closes the button end pin', () => {
    const {state} = run([{type: 'buttonPress', edge: 'end', now: 1000}, {type: 'dragBegin'}], settledAtEnd);
    expect(state.endPin).toBeNull();
  });
});

describe('page fill', () => {
  const short = {offset: 0, viewportHeight: viewport, contentHeight: 400};

  it('re-pins and opens a fill end pin once the content outgrows the viewport', () => {
    const filling = run([scroll(short), {type: 'loadPrevious', pinEndOnFill: true}], settledAtEnd).state;
    const {state, commands} = run([{type: 'contentSize', height: 900, metrics: short, now: 1000}], filling);
    expect(commands[0]).toEqual({type: 'repin'});
    expect(state.pendingFillPin).toBe(false);
    expect(state.endPin).toEqual({reason: 'fill', until: 1000 + END_PIN_MS});
  });

  it('does not re-pin a list that still fits', () => {
    const filling = run([{type: 'loadPrevious', pinEndOnFill: true}], settledAtEnd).state;
    const {state, commands} = run([{type: 'contentSize', height: 450, metrics: short, now: 1000}], filling);
    expect(commands).toEqual([]);
    expect(state.pendingFillPin).toBe(true);
  });

  it('drops the pin without scrolling while the user drags', () => {
    const filling = run([{type: 'loadPrevious', pinEndOnFill: true}, {type: 'dragBegin'}], settledAtEnd).state;
    const {state, commands} = run([{type: 'contentSize', height: 900, metrics: short, now: 1000}], filling);
    expect(commands).toEqual([]);
    expect(state.pendingFillPin).toBe(false);
    expect(state.endPin).toBeNull();
  });
});

describe('own posts', () => {
  it('always follows the user own post, even mid-drag', () => {
    const dragging = run([scroll(farUp), {type: 'dragBegin'}], settledAtEnd).state;
    expect(commandsFor(dragging, {type: 'ownItemAppended'})).toEqual([{type: 'followOwnItem'}]);
  });
});
