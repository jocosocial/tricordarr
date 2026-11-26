/**
 * The one place that decides when ChatList moves its own scroll position.
 *
 * FlashList moves the list on its own (maintain-visible-content-position, the bottom autoscroll, the
 * initial scroll). ChatList adds its own scrolls on top: anchor corrections before reveal, re-pins to
 * the end when a resize (the keyboard) or growing content would leave it short, the scroll buttons,
 * and scrolling to the user's own post. Those used to be separate writers coordinated by flags that
 * several hooks set and cleared. This reducer now owns all of that state. Each hook turns what it
 * sees (a scroll event, a resize, a press) into an `ArbiterEvent`. The reducer answers with
 * the `ScrollCommand`s to run, and `useChatListScrollArbiter` is the only code that runs them.
 *
 * State, by name:
 * - `phase`: `positioning` until the list has landed on its anchor and been revealed, then
 *   `settled`. Nothing re-pins while positioning.
 * - `gesture`: `dragging` or `flinging` while the user scrolls. A user scroll always wins: a drag
 *   cancels pending re-pins and closes any end pin, and no re-pin starts until the gesture ends.
 *   Android also fires momentum events for programmatic animated scrolls (scrollToEnd), so momentum
 *   only counts as the user's fling when the drag before it ended with velocity (`flingExpected`)
 *   and no animated scroll of ours has started since.
 * - `following`: the user is within a threshold of the bottom, as of the last scroll event. Gates
 *   the resize re-pin.
 * - `endPin`: until `until` (ms), content growth while the list sits at the end re-pins the end.
 *   Opened by a scroll-to-bottom press (`button`) or by a short list outgrowing its viewport after a
 *   page fill (`fill`).
 * - `pendingFillPin`: an older page was loaded into an end-anchored list that does not fill the
 *   viewport yet; once the content outgrows the viewport, an end pin opens (see `Pagination.ts`).
 * - `buttonTarget`: the edge a scroll button sent the list to, resent if the scroll is cut short.
 *
 * The individual predicates live in `Pinning.ts` and `ScrollButtons.ts`; why each re-pin is needed
 * is explained there.
 */

import {END_PIN_MS} from '#src/Libraries/ChatList/Constants';
import {hasOutgrownViewport, shouldRepinOnContentGrowth, shouldRepinOnResize} from '#src/Libraries/ChatList/Pinning';
import {
  ButtonScrollEdge,
  ButtonScrollTarget,
  createButtonScrollTarget,
  getButtonRetryAction,
  getDistanceFromBottom,
  hasReachedButtonEdge,
  ScrollMetrics,
} from '#src/Libraries/ChatList/ScrollButtons';

export type ArbiterPhase = 'positioning' | 'settled';
export type ArbiterGesture = 'none' | 'dragging' | 'flinging';
export type EndPinReason = 'button' | 'fill';

export interface ScrollArbiterState {
  phase: ArbiterPhase;
  gesture: ArbiterGesture;
  following: boolean;
  endPin: {reason: EndPinReason; until: number} | null;
  pendingFillPin: boolean;
  buttonTarget: ButtonScrollTarget | null;
  /** Height of the list's container, from its onLayout. Null before the first layout. */
  containerHeight: number | null;
  /**
   * The last drag ended with velocity, so the next momentum is the user's fling. Cleared when that
   * momentum begins, by a new drag, and by any animated scroll of ours (whose momentum is not the user's).
   */
  flingExpected: boolean;
}

export const initialScrollArbiterState: ScrollArbiterState = {
  phase: 'positioning',
  gesture: 'none',
  following: true,
  endPin: null,
  pendingFillPin: false,
  buttonTarget: null,
  containerHeight: null,
  flingExpected: false,
};

export type ArbiterEvent =
  /** The list is at its initial position and has been revealed. */
  | {type: 'ready'}
  /** The ready check measured the anchor off its target and wants to correct it. */
  | {type: 'anchorCorrection'; offset: number}
  /**
   * A scroll event. `threshold` is the near-bottom distance (`styleDefaults.listScrollThreshold`),
   * `margin` the slack at the top for a button target (`styleDefaults.marginSize`).
   */
  | {type: 'scroll'; metrics: ScrollMetrics; threshold: number; margin: number}
  /** The content height changed. `metrics` are the scroll metrics from before the change. */
  | {type: 'contentSize'; height: number; metrics: ScrollMetrics | null; now: number}
  | {type: 'dragBegin'}
  /** A user drag ended; `flingExpected` when it ended with velocity, so momentum will follow. */
  | {type: 'dragEnd'; flingExpected: boolean}
  | {type: 'momentumBegin'}
  /** Momentum ended. `now` times a button end pin reopened by a resend. */
  | {type: 'momentumEnd'; now: number}
  /** Any touch on the list, which hands it back to the user. */
  | {type: 'touchStart'}
  /** The list's container was laid out. */
  | {type: 'resize'; height: number}
  | {type: 'buttonPress'; edge: ButtonScrollEdge; now: number}
  | {type: 'dividerPress'; index: number; viewPosition: number}
  /** The page fill is loading an older page; `pinEndOnFill` from `getPageFillAction`. */
  | {type: 'loadPrevious'; pinEndOnFill: boolean}
  /** A post by the current user landed at the end. */
  | {type: 'ownItemAppended'};

export type ScrollCommand =
  /** scrollToEnd without animation on the next frame, replacing any pending re-pin. */
  | {type: 'repin'}
  /** Animated scrollToEnd on the next frame, replacing any pending own-item scroll. */
  | {type: 'followOwnItem'}
  /** Cancel the pending re-pin frame. */
  | {type: 'cancelPending'}
  | {type: 'scrollToEnd'; animated: boolean}
  | {type: 'scrollToOffset'; offset: number; animated: boolean}
  | {type: 'scrollToIndex'; index: number; viewPosition: number};

export interface ScrollArbiterStep {
  state: ScrollArbiterState;
  commands: ScrollCommand[];
}

/** The scroll a button press (or its retry) sends; pressing toward the end opens a button end pin. */
const scrollToButtonEdge = (state: ScrollArbiterState, edge: ButtonScrollEdge, now: number): ScrollArbiterStep =>
  edge === 'end'
    ? {
        state: {...state, endPin: {reason: 'button', until: now + END_PIN_MS}},
        commands: [{type: 'scrollToEnd', animated: true}],
      }
    : {state, commands: [{type: 'scrollToOffset', offset: 0, animated: true}]};

/** Whether a command starts an animated scroll, whose momentum events are ours and not the user's. */
const isAnimatedScroll = (command: ScrollCommand) =>
  command.type === 'followOwnItem' ||
  command.type === 'scrollToIndex' ||
  ((command.type === 'scrollToEnd' || command.type === 'scrollToOffset') && command.animated);

/**
 * Applies one event to the arbiter state and returns the scroll commands it calls for. Pure.
 *
 * @param state Current state.
 * @param event What happened.
 */
export const reduceScrollArbiter = (state: ScrollArbiterState, event: ArbiterEvent): ScrollArbiterStep => {
  const step = reduceEvent(state, event);
  return step.state.flingExpected && step.commands.some(isAnimatedScroll)
    ? {...step, state: {...step.state, flingExpected: false}}
    : step;
};

/**
 * The per-event part of `reduceScrollArbiter`.
 *
 * @param state Current state.
 * @param event What happened.
 */
const reduceEvent = (state: ScrollArbiterState, event: ArbiterEvent): ScrollArbiterStep => {
  const ready = state.phase === 'settled';
  const userScrolling = state.gesture !== 'none';
  switch (event.type) {
    case 'ready':
      return {state: {...state, phase: 'settled'}, commands: []};

    case 'anchorCorrection':
      return ready
        ? {state, commands: []}
        : {state, commands: [{type: 'scrollToOffset', offset: event.offset, animated: false}]};

    case 'scroll': {
      const distanceFromBottom = getDistanceFromBottom(event.metrics);
      const reached =
        state.buttonTarget !== null &&
        hasReachedButtonEdge(state.buttonTarget.edge, event.metrics.offset, distanceFromBottom, event.margin);
      return {
        state: {
          ...state,
          following: distanceFromBottom <= event.threshold,
          buttonTarget: reached ? null : state.buttonTarget,
        },
        commands: [],
      };
    }

    case 'contentSize': {
      let next = state;
      const commands: ScrollCommand[] = [];
      if (hasOutgrownViewport(state.pendingFillPin, state.containerHeight, event.height)) {
        next = {...next, pendingFillPin: false};
        if (!userScrolling) {
          next = {...next, endPin: {reason: 'fill', until: event.now + END_PIN_MS}};
          commands.push({type: 'repin'});
        }
      }
      if (
        event.metrics &&
        event.metrics.contentHeight !== event.height &&
        shouldRepinOnContentGrowth({
          metrics: event.metrics,
          contentHeight: event.height,
          now: event.now,
          endPinUntil: next.endPin?.until ?? 0,
          userScrolling,
        })
      ) {
        commands.push({type: 'repin'});
      }
      return {state: next, commands};
    }

    case 'dragBegin':
      return {
        state: {...state, gesture: 'dragging', endPin: null, flingExpected: false},
        commands: [{type: 'cancelPending'}],
      };

    case 'dragEnd':
      return {state: {...state, gesture: 'none', flingExpected: event.flingExpected}, commands: []};

    case 'momentumBegin':
      return state.flingExpected
        ? {state: {...state, gesture: 'flinging', flingExpected: false}, commands: []}
        : {state, commands: []};

    case 'momentumEnd': {
      const settled = {...state, gesture: 'none' as const};
      const target = state.buttonTarget;
      if (!target) {
        return {state: settled, commands: []};
      }
      // A button scroll that ended short of its edge (the target clears once it lands) was cut short.
      if (getButtonRetryAction(target) === 'clear') {
        return {state: {...settled, buttonTarget: null}, commands: []};
      }
      return scrollToButtonEdge(
        {...settled, buttonTarget: {...target, retries: target.retries + 1}},
        target.edge,
        event.now,
      );
    }

    case 'touchStart':
      return {state: {...state, buttonTarget: null}, commands: []};

    case 'resize': {
      const repin = shouldRepinOnResize({
        previousHeight: state.containerHeight,
        height: event.height,
        ready,
        userScrolling,
        nearBottom: state.following,
      });
      return {state: {...state, containerHeight: event.height}, commands: repin ? [{type: 'repin'}] : []};
    }

    case 'buttonPress':
      return scrollToButtonEdge({...state, buttonTarget: createButtonScrollTarget(event.edge)}, event.edge, event.now);

    case 'dividerPress':
      return {state, commands: [{type: 'scrollToIndex', index: event.index, viewPosition: event.viewPosition}]};

    case 'loadPrevious':
      return {state: {...state, pendingFillPin: event.pinEndOnFill}, commands: []};

    case 'ownItemAppended':
      // The user's own post always lands in view, wherever they were.
      return {state, commands: [{type: 'followOwnItem'}]};
  }
};
