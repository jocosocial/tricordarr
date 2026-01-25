import {type FlashListRef} from '@shopify/flash-list';
import {useCallback, useEffect, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import useDateTime, {calcCruiseDayTime} from '#src/Libraries/DateTime';
import {getScheduleScrollIndex} from '#src/Libraries/Schedule';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

interface UseScrollToNowOptions<T> {
  /**
   * List of schedule items (events or LFGs) to calculate scroll position from.
   */
  items: T[];
  /**
   * Reference to the FlashList component to scroll.
   */
  listRef: React.RefObject<FlashListRef<T> | null>;
}

interface UseScrollToNowReturn {
  /**
   * Callback to scroll the list to the current time position.
   * Handles edge cases (start, end, middle) automatically.
   */
  scrollToNow: () => void;
  /**
   * The calculated index where "now" is in the list.
   * Updates automatically as time passes and list changes.
   */
  scrollNowIndex: number;
}

/**
 * Hook to manage scroll-to-now functionality for schedule lists.
 *
 * Calculates the current time position in a schedule list and provides
 * a callback to scroll to that position. The scroll index updates
 * automatically as time passes (minutely) and when the list changes.
 *
 * @example
 * ```tsx
 * const [items, setItems] = useState<FezData[]>([]);
 * const listRef = useRef<FlashListRef<FezData>>(null);
 *
 * const {scrollToNow, scrollNowIndex} = useScrollToNow({
 *   items,
 *   listRef,
 * });
 *
 * // Pass to ScheduleHeaderView
 * <ScheduleHeaderView
 *   selectedCruiseDay={selectedCruiseDay}
 *   setCruiseDay={handleSetCruiseDay}
 *   scrollToNow={scrollToNow}
 * />
 *
 * // Or use initialScrollIndex for initial positioning
 * <ScheduleFlatList
 *   listRef={listRef}
 *   items={items}
 *   initialScrollIndex={scrollNowIndex}
 * />
 * ```
 */
export function useScrollToNow<T extends EventData | FezData>({
  items,
  listRef,
}: UseScrollToNowOptions<T>): UseScrollToNowReturn {
  const {appConfig} = useConfig();
  const {startDate, endDate} = useCruise();
  const [scrollNowIndex, setScrollNowIndex] = useState(0);
  const minutelyUpdatingDate = useDateTime('minute');

  // Calculate scroll index for current time
  useEffect(() => {
    if (items.length > 0) {
      const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
      const index = getScheduleScrollIndex(nowDayTime, items, startDate, endDate, appConfig.portTimeZoneID);
      setScrollNowIndex(index);
    }
  }, [appConfig.portTimeZoneID, endDate, minutelyUpdatingDate, items, startDate]);

  const scrollToNow = useCallback(() => {
    if (items.length === 0 || !listRef.current) {
      return;
    }
    if (scrollNowIndex === 0) {
      listRef.current.scrollToOffset({offset: 0});
    } else if (scrollNowIndex === items.length - 1) {
      listRef.current.scrollToEnd();
    } else {
      listRef.current.scrollToIndex({
        index: scrollNowIndex,
        // The viewOffset is so that we show the TimeSeparator in the view as well.
        viewOffset: 40,
        animated: true,
      });
    }
  }, [items, scrollNowIndex, listRef]);

  return {
    scrollToNow,
    scrollNowIndex,
  };
}
