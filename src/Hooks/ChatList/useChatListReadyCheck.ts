import {useCallback, useEffect, useRef, useState} from 'react';

import type {TChatListRefObject} from '#src/Components/Lists/ChatList';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import type {ChatListSharedState} from '#src/Hooks/ChatList/useChatListSharedState';
import {
  computeAnchorError,
  initialReadyCheckState,
  ReadyCheckState,
  resolveAnchorIndex,
  stepReadyCheck,
} from '#src/Libraries/ChatList/Anchor';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('useChatListReadyCheck.ts');

interface UseChatListReadyCheckProps<TItem> {
  listRef: TChatListRefObject<TItem>;
  shared: ChatListSharedState;
  data: TItem[];
  keyExtractor: (item: TItem) => string;
  /** Index of the anchored item, or undefined for an end anchor. */
  anchorIndex?: number;
  onReadyToShow?: () => void;
}

/**
 * Lands ChatList on its anchor and reveals it: `onReadyToShow` fires once the initial position holds,
 * or after a bounded number of frames so the parent's overlay can never stick. Why the position needs
 * correcting at all is explained in `src/Libraries/ChatList/Anchor.ts`.
 *
 * Returns `ready` (state, for effects that must wait for the reveal) and the `onLoad` to hand FlashList.
 */
export const useChatListReadyCheck = <TItem>({
  listRef,
  shared,
  data,
  keyExtractor,
  anchorIndex,
  onReadyToShow,
}: UseChatListReadyCheckProps<TItem>) => {
  const {styleDefaults} = useStyles();
  const dataLengthRef = useRef(data.length);
  const dataRef = useRef(data);
  const onReadyToShowRef = useRef(onReadyToShow);
  // The index anchor is tracked by item key, not position: an older page can be prepended (FlashList
  // fires onStartReached at mount when the anchor is near the top) before positioning finishes, which
  // shifts every index. Captured once at mount, like FlashList's own initialScrollIndex.
  const [anchorKey] = useState(() =>
    anchorIndex !== undefined && anchorIndex < data.length ? keyExtractor(data[anchorIndex]) : undefined,
  );
  const [ready, setReady] = useState(false);
  const readyFrameRef = useRef<number | null>(null);

  useEffect(() => {
    dataLengthRef.current = data.length;
    dataRef.current = data;
    onReadyToShowRef.current = onReadyToShow;
  });

  // Every frame started here is cancelled on unmount. Parent screens remount the list via `key`, and
  // a callback from a replaced instance must never reveal the new one early.
  useEffect(() => {
    return () => {
      if (readyFrameRef.current !== null) {
        cancelAnimationFrame(readyFrameRef.current);
      }
    };
  }, []);

  /** Fires `onReadyToShow` at most once. */
  const fireReadyToShow = useCallback(() => {
    if (shared.readyFired.current) {
      return;
    }
    shared.readyFired.current = true;
    setReady(true);
    logger.debug('Firing onReadyToShow');
    onReadyToShowRef.current?.();
  }, [shared]);

  /**
   * Measures how far (in pixels) the current scroll offset is from the anchor's target offset (see
   * `computeAnchorError`). Undefined when layout is not available yet.
   */
  const getAnchorError = useCallback(
    (index?: number) => {
      const list = listRef.current;
      const endOffset = shared.getEndOffset();
      if (!list || endOffset === undefined) {
        return undefined;
      }
      let itemY: number | undefined;
      if (index !== undefined) {
        const layout = list.getLayout(index);
        if (!layout) {
          return undefined;
        }
        itemY = layout.y;
      }
      // Our own onScroll metrics update on the scroll event itself; FlashList's tracked offset is
      // updated from a deferred velocity callback and lags a correction by a frame or more.
      const offset = shared.scrollMetrics.current?.offset ?? list.getAbsoluteLastScrollOffset();
      return computeAnchorError({
        offset,
        endOffset,
        itemY,
        firstItemOffset: list.getFirstItemOffset(),
        margin: styleDefaults.marginSize,
      });
    },
    [listRef, shared, styleDefaults.marginSize],
  );

  /**
   * Starts the per-frame check that reveals the list once the initial scroll has landed. The
   * decisions are in `stepReadyCheck` (`src/Libraries/ChatList/Anchor.ts`).
   */
  const startReadyCheck = useCallback(() => {
    let state: ReadyCheckState = initialReadyCheckState;
    const tick = () => {
      readyFrameRef.current = null;
      const step = stepReadyCheck(state, () =>
        getAnchorError(
          anchorIndex === undefined
            ? undefined
            : resolveAnchorIndex(dataRef.current, keyExtractor, anchorKey, anchorIndex),
        ),
      );
      state = step.state;
      if (step.scrollTo !== undefined) {
        logger.debug(`Anchor correction ${state.corrections}: off by ${Math.round(state.lastError ?? 0)}px`);
        listRef.current?.scrollToOffset({offset: step.scrollTo, animated: false});
      }
      if (step.ready) {
        fireReadyToShow();
      } else {
        readyFrameRef.current = requestAnimationFrame(tick);
      }
    };
    readyFrameRef.current = requestAnimationFrame(tick);
  }, [anchorIndex, anchorKey, getAnchorError, keyExtractor, fireReadyToShow, listRef]);

  /**
   * FlashList fires `onLoad` once after first layout. That is not "initial scroll done", so it only
   * starts the position check above. Empty lists have nothing to position and are ready at once.
   */
  const onLoad = useCallback(() => {
    if (dataLengthRef.current === 0) {
      fireReadyToShow();
      return;
    }
    startReadyCheck();
  }, [fireReadyToShow, startReadyCheck]);

  // Explicit guard in case onLoad does not fire for empty data. The frame re-checks emptiness so a
  // callback queued while empty cannot reveal a list that has since received data, and the effect
  // cleanup cancels it on unmount.
  const isEmpty = data.length === 0;
  useEffect(() => {
    if (!isEmpty) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      if (dataLengthRef.current === 0) {
        fireReadyToShow();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isEmpty, fireReadyToShow]);

  return {ready, onLoad};
};
