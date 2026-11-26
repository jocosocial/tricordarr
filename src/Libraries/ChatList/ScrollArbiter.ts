/**
 * The one place that decides when ChatList moves its own scroll position.
 *
 * FlashList moves the list on its own (maintain-visible-content-position, the bottom autoscroll, the
 * initial scroll). ChatList adds its own scrolls on top: anchor corrections before reveal, re-pins to
 * the end when the keyboard, a resize or growing content would leave it short, the scroll buttons,
 * and scrolling to the user's own post. Those used to be separate writers coordinated by flags that
 * several hooks set and cleared. This reducer now owns all of that state. Each hook turns what it
 * sees (a scroll event, a keyboard event, a press) into an `ArbiterEvent`. The reducer answers with
 * the `ScrollCommand`s to run, and `useChatListScrollArbiter` is the only code that runs them.
 *
 * State, by name:
 * - `phase`: `positioning` until the list has landed on its anchor and been revealed, then
 *   `settled`. Nothing re-pins while positioning.
 * - `gesture`: `dragging` or `flinging` while the user scrolls. A user scroll always wins: a drag
 *   cancels pending re-pins and closes any end pin, and no re-pin starts until the gesture ends.
 *   Android also fires momentum events for programmatic animated scrolls (scrollToEnd), so momentum
 *   only counts as the user's fling when it starts right after a drag ends (`isUserFling`).
 * - `following`: the user is within a threshold of the bottom, as of the last scroll event. Gates
 *   the resize and keyboard re-pins.
 * - `endPin`: until `until` (ms), content growth while the list sits at the end re-pins the end.
 *   Opened by a scroll-to-bottom press (`button`) or by a short list outgrowing its viewport after a
 *   page fill (`fill`).
 * - `keyboardPin`: near-bottom as snapshotted when the keyboard started to move, held through the
 *   delayed re-pins after it settles.
 * - `pendingFillPin`: an older page was loaded into an end-anchored list that does not fill the
 *   viewport yet; once the content outgrows the viewport, an end pin opens (see `Pagination.ts`).
 * - `buttonTarget`: the edge a scroll button sent the list to, resent if the scroll is cut short.
 *
 * The individual predicates live in `Pinning.ts` and `ScrollButtons.ts`; why each re-pin is needed
 * is explained there.
 */

import {END_PIN_MS} from '#src/Libraries/ChatList/Constants';
import {
  hasOutgrownViewport,
  isUserFling,
  shouldPinAfterKeyboard,
  shouldRepinOnContentGrowth,
  shouldRepinOnResize,
} from '#src/Libraries/ChatList/Pinning';
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
  keyboardPin: boolean;
  pendingFillPin: boolean;
  buttonTarget: ButtonScrollTarget | null;
  /** Height of the list's container, from its onLayout. Null before the first layout. */
  containerHeight: number | null;
  /** When the last drag ended (ms), to tell a fling from programmatic momentum. */
  dragEndedAt: number;
}

export const initialScrollArbiterState: ScrollArbiterState = {
  phase: 'positioning',
  gesture: 'none',
  following: true,
  endPin: null,
  keyboardPin: false,
  pendingFillPin: false,
  buttonTarget: null,
  containerHeight: null,
  dragEndedAt: 0,
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
  | {type: 'dragEnd'; now: number}
  | {type: 'momentumBegin'; now: number}
  | {type: 'momentumEnd'; now: number}
  /** Any touch on the list, which hands it back to the user. */
  | {type: 'touchStart'}
  /** The list's container was laid out. */
  | {type: 'resize'; height: number}
  | {type: 'keyboardWill'}
  | {type: 'keyboardDid'}
  /** One of the delayed re-pins after the keyboard settled fired; `last` for the final one. */
  | {type: 'keyboardSettleStep'; last: boolean}
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
  /** Start (or restart) the delayed re-pins after the keyboard settles (`KEYBOARD_SETTLE_DELAYS_MS`). */
  | {type: 'startKeyboardSettle'}
  /** Cancel the pending re-pin frame and the keyboard re-pins. */
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

/**
 * Applies one event to the arbiter state and returns the scroll commands it calls for. Pure.
 *
 * @param state Current state.
 * @param event What happened.
 */
export const reduceScrollArbiter = (state: ScrollArbiterState, event: ArbiterEvent): ScrollArbiterStep => {
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
        state: {...state, gesture: 'dragging', keyboardPin: false, endPin: null},
        commands: [{type: 'cancelPending'}],
      };

    case 'dragEnd':
      return {state: {...state, gesture: 'none', dragEndedAt: event.now}, commands: []};

    case 'momentumBegin':
      return isUserFling(event.now, state.dragEndedAt)
        ? {state: {...state, gesture: 'flinging'}, commands: []}
        : {state, commands: []};

    case 'momentumEnd': {
      const settled = {...state, gesture: 'none' as const};
      const target = state.buttonTarget;
      if (!target) {
        return {state: settled, commands: []};
      }
      // A button scroll that ended short of its edge (the target clears once it lands) was cut short.
      if (getButtonRetryAction(target, event.now) === 'clear') {
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
        keyboardPinned: state.keyboardPin,
      });
      return {state: {...state, containerHeight: event.height}, commands: repin ? [{type: 'repin'}] : []};
    }

    case 'keyboardWill':
      return {state: {...state, keyboardPin: ready && state.following}, commands: []};

    case 'keyboardDid': {
      const pinned = shouldPinAfterKeyboard({
        userScrolling,
        keyboardPinned: state.keyboardPin,
        ready,
        nearBottom: state.following,
      });
      return {
        state: {...state, keyboardPin: pinned},
        commands: pinned ? [{type: 'repin'}, {type: 'startKeyboardSettle'}] : [],
      };
    }

    case 'keyboardSettleStep':
      // Unconditional while the re-pins run: a drag cancels them before they get here.
      return {
        state: event.last ? {...state, keyboardPin: false} : state,
        commands: [{type: 'scrollToEnd', animated: false}],
      };

    case 'buttonPress':
      return scrollToButtonEdge(
        {...state, buttonTarget: createButtonScrollTarget(event.edge, event.now)},
        event.edge,
        event.now,
      );

    case 'dividerPress':
      return {state, commands: [{type: 'scrollToIndex', index: event.index, viewPosition: event.viewPosition}]};

    case 'loadPrevious':
      return {state: {...state, pendingFillPin: event.pinEndOnFill}, commands: []};

    case 'ownItemAppended':
      // The user's own post always lands in view, wherever they were.
      return {state, commands: [{type: 'followOwnItem'}]};
  }
};
