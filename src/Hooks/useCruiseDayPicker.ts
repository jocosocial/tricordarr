import {type FlashListRef} from '@shopify/flash-list';
import {SetStateAction, useCallback, useState} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';

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
}

interface UseCruiseDayPickerResult {
  /**
   * The currently selected cruise day (1-indexed).
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
export function useCruiseDayPicker<T>({listRef, clearList}: UseCruiseDayPickerOptions<T>): UseCruiseDayPickerResult {
  const {adjustedCruiseDayToday} = useCruise();

  // Default to day 1 if cruise context isn't ready yet
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(adjustedCruiseDayToday || 1);
  const [isSwitchingDays, setIsSwitchingDays] = useState(false);

  const handleSetCruiseDay = useCallback(
    (day: SetStateAction<number>) => {
      // Resolve the new day value (handles both direct values and updater functions)
      const newDay = typeof day === 'function' ? day(selectedCruiseDay) : day;

      // Skip if selecting the same day - prevents stuck loading spinner
      if (newDay === selectedCruiseDay) {
        return;
      }

      clearList(); // Clear list immediately for instant feedback
      setIsSwitchingDays(true); // Show loading indicator
      setSelectedCruiseDay(newDay);
      listRef.current?.scrollToOffset({offset: 0, animated: false}); // Reset scroll position
    },
    [clearList, listRef, selectedCruiseDay],
  );

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
