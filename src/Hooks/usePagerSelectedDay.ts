import {type SharedValue, useEvent, useHandler, useSharedValue} from 'react-native-reanimated';

/** Shape of react-native-pager-view's onPageScroll payload. */
interface PagerScrollEventData extends Record<string, unknown> {
  position: number;
  offset: number;
}

export interface PagerSelectedDay {
  /**
   * The cruise day a drag has currently landed on (1-indexed), maintained on the UI thread so it
   * can move ahead of the committed React state. Rounded to a whole day and only written when it
   * actually changes, so a swipe updates it twice rather than once per frame - anything reading
   * it in a useAnimatedStyle re-evaluates only at the crossings that matter.
   */
  liveSelectedDay: SharedValue<number>;
  /** Attach to an Animated PagerView's onPageScroll prop. */
  onPageScroll: unknown;
}

/**
 * Tracks which day a PagerView drag has reached, as a Reanimated shared value.
 *
 * react-native-pager-view ships no Reanimated handler, so this is the useHandler + useEvent
 * recipe: the worklet runs on the UI thread, which is the whole point - a header highlight built
 * on top of this can't be starved by a busy JS thread mid-swipe, and doesn't have to wait for
 * onPageSelected (which only fires once the pager has fully settled, noticeably after the content
 * has visually arrived).
 *
 * The event name is matched with endsWith so this works whether or not the new architecture
 * prefixes it with "top".
 *
 * @param initialDay cruise day to report before the first scroll event.
 * @param totalDays highest valid cruise day; the value is clamped to it because `overdrag` lets
 *   the pager report out-of-range offsets past the first and last page.
 */
export const usePagerSelectedDay = (initialDay: number, totalDays: number): PagerSelectedDay => {
  const liveSelectedDay = useSharedValue(initialDay);

  const handlers = {
    onPageScroll: (event: PagerScrollEventData) => {
      'worklet';
      const day = event.position + event.offset + 1;
      // Round rather than interpolate: the selection is a hard switch at the halfway point, with
      // no intermediate state, so there is nothing to gain from reporting the fraction.
      const nearest = Math.round(Math.min(Math.max(day, 1), totalDays));
      if (liveSelectedDay.value !== nearest) {
        liveSelectedDay.value = nearest;
      }
    },
  };

  const {doDependenciesDiffer} = useHandler(handlers, [totalDays]);

  const onPageScroll = useEvent<PagerScrollEventData>(
    event => {
      'worklet';
      if (event.eventName.endsWith('onPageScroll')) {
        handlers.onPageScroll(event);
      }
    },
    ['onPageScroll', 'topPageScroll'],
    doDependenciesDiffer,
  );

  return {liveSelectedDay, onPageScroll};
};
