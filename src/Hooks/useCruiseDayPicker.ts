import {type FlashListRef} from '@shopify/flash-list';
import {Dispatch, SetStateAction, useCallback, useLayoutEffect, useRef, useState} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useFollowCruiseDayToday} from '#src/Hooks/useFollowCruiseDayToday';

const noopFollowToday = (_day: number) => {};

interface UseCruiseDayPickerOptions<T> {
  /**
   * Reference to the FlashList component, used to reset scroll position when day changes.
   */
  listRef: React.RefObject<FlashListRef<T> | null>;
  /**
   * Callback to clear list data immediately when day changes.
   * This runs synchronously before React re-renders, providing instant feedback.
   */
  clearList: () => void;
  /**
   * Optional default cruise day to use instead of adjustedCruiseDayToday.
   * Useful for navigation where a specific day should be shown initially.
   * When controlled, applied via layout effect keyed on this value only (deep links / intent remounts).
   */
  defaultCruiseDay?: number;
  /**
   * Controlled selected day. When passed with setSelectedCruiseDay, internal state is unused
   * (e.g. shared ScheduleCruiseDayContext).
   */
  selectedCruiseDay?: number;
  /**
   * Controlled setter. When passed with selectedCruiseDay, follow-today is owned by the provider.
   */
  setSelectedCruiseDay?: Dispatch<SetStateAction<number>>;
}

interface UseCruiseDayPickerResult {
  /**
   * The currently selected cruise day (1-indexed, or 0 for "All Days").
   * Note: 0 means "All Days" in the UI, not the same as cruiseDay: 0 in the API.
   */
  selectedCruiseDay: number;
  /**
   * Whether a day switch is in progress (data is being fetched).
   */
  isSwitchingDays: boolean;
  /**
   * Handler to change the selected day. Clears list, sets loading state, and resets scroll.
   */
  handleSetCruiseDay: (day: SetStateAction<number>) => void;
  /**
   * Call this when data has loaded to reset the switching state.
   * Typically called in a useEffect that watches query data.
   */
  onDataLoaded: () => void;
  /**
   * Call this when a query error occurs to reset the switching state.
   * Prevents stuck loading spinners on error.
   */
  onQueryError: () => void;
}

/**
 * Hook to manage cruise day picker state and day switching UX.
 *
 * Provides state management for:
 * - Selected cruise day
 * - Day switching loading state
 * - Scroll position reset on day change
 * - Following cruise "today" across overnight / late-day rollover when the user is still on the previous today
 *
 * Pass both selectedCruiseDay and setSelectedCruiseDay to control the day from outside
 * (shared context). Follow-today is skipped in that mode so the owner can listen once.
 *
 * @example
 * ```tsx
 * const [items, setItems] = useState<FezData[]>([]);
 * const listRef = useRef<FlashListRef<FezData>>(null);
 *
 * const {selectedCruiseDay, isSwitchingDays, handleSetCruiseDay, onDataLoaded, onQueryError} =
 *   useCruiseDayPicker({
 *     listRef,
 *     clearList: () => setItems([]),
 *   });
 *
 * // In data loading effect:
 * useEffect(() => {
 *   if (data) {
 *     setItems(data.pages.flatMap(p => p.items));
 *     onDataLoaded();
 *   }
 * }, [data, onDataLoaded]);
 *
 * // In error handling effect:
 * useEffect(() => {
 *   if (isError) onQueryError();
 * }, [isError, onQueryError]);
 * ```
 */
export function useCruiseDayPicker<T>({
  listRef,
  clearList,
  defaultCruiseDay,
  selectedCruiseDay: selectedCruiseDayProp,
  setSelectedCruiseDay: setSelectedCruiseDayProp,
}: UseCruiseDayPickerOptions<T>): UseCruiseDayPickerResult {
  const {adjustedCruiseDayToday} = useCruise();
  const isControlled = selectedCruiseDayProp !== undefined && setSelectedCruiseDayProp !== undefined;

  // Default to defaultCruiseDay if provided, otherwise current day if cruise context is ready, otherwise day 1
  // Note: selectedCruiseDay can be 0 (meaning "All Days"), which is different from cruiseDay: 0 in the API
  const [internalCruiseDay, setInternalCruiseDay] = useState(
    defaultCruiseDay !== undefined ? defaultCruiseDay : adjustedCruiseDayToday || 1,
  );
  const [isSwitchingDays, setIsSwitchingDays] = useState(false);

  const selectedCruiseDay = isControlled ? selectedCruiseDayProp : internalCruiseDay;
  const setSelectedCruiseDay = isControlled ? setSelectedCruiseDayProp : setInternalCruiseDay;
  const previousCruiseDayRef = useRef(selectedCruiseDay);

  /**
   * Apply day-switch UX: clear list, show spinner, reset scroll.
   */
  const applyDaySwitchUx = useCallback(() => {
    clearList();
    setIsSwitchingDays(true);
    listRef.current?.scrollToOffset({offset: 0, animated: false});
  }, [clearList, listRef]);

  const handleSetCruiseDay = useCallback(
    (day: SetStateAction<number>) => {
      // Resolve the new day value (handles both direct values and updater functions)
      const newDay = typeof day === 'function' ? day(selectedCruiseDay) : day;

      // Skip if selecting the same day - prevents stuck loading spinner
      // Note: 0 is a valid value (means "All Days")
      if (newDay === selectedCruiseDay) {
        return;
      }

      previousCruiseDayRef.current = newDay;
      applyDaySwitchUx();
      setSelectedCruiseDay(newDay);
    },
    [applyDaySwitchUx, selectedCruiseDay, setSelectedCruiseDay],
  );

  useFollowCruiseDayToday(selectedCruiseDay, isControlled ? noopFollowToday : handleSetCruiseDay);

  /**
   * Seed/override from a route param without fighting later header or planner changes.
   * Route params stay stale across goBack, so this is keyed on defaultCruiseDay only.
   */
  useLayoutEffect(() => {
    if (!isControlled || defaultCruiseDay === undefined) {
      return;
    }
    setSelectedCruiseDay(defaultCruiseDay);
  }, [defaultCruiseDay, isControlled, setSelectedCruiseDay]);

  /**
   * When the day changes from outside (shared context), run the same switching UX
   * so a hidden Schedule Day list does not flash stale items on Back.
   */
  useLayoutEffect(() => {
    if (previousCruiseDayRef.current === selectedCruiseDay) {
      return;
    }
    previousCruiseDayRef.current = selectedCruiseDay;
    applyDaySwitchUx();
  }, [applyDaySwitchUx, selectedCruiseDay]);

  const onDataLoaded = useCallback(() => {
    setIsSwitchingDays(false);
  }, []);

  const onQueryError = useCallback(() => {
    setIsSwitchingDays(false);
  }, []);

  return {
    selectedCruiseDay,
    isSwitchingDays,
    handleSetCruiseDay,
    onDataLoaded,
    onQueryError,
  };
}
