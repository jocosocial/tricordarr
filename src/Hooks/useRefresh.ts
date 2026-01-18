import {useCallback, useEffect, useRef, useState} from 'react';

export interface UseRefreshProps {
  refresh: () => Promise<any>;
  isRefreshing?: boolean;
}

export interface UseRefreshReturn {
  refreshing: boolean;
  setRefreshing: (value: boolean) => void;
  onRefresh: () => Promise<void>;
}

/**
 * Hook to manage pull-to-refresh state and operations.
 *
 * Encapsulates the common pattern of managing refreshing state around async refresh operations.
 * Supports both manual refresh calls and external signals via the `isRefreshing` prop.
 *
 * @param props - Configuration props
 * @param props.refresh - Async function to execute during refresh
 * @param props.isRefreshing - Optional external signal indicating refresh activity. When it transitions from true to false/undefined, the internal refreshing state is set to false.
 *
 * @returns An object with refreshing state, setter, and onRefresh callback
 *
 * @example
 * ```ts
 * const {refreshing, setRefreshing, onRefresh} = useRefresh({
 *   refresh: refetch, // Can pass React Query refetch directly
 *   isRefreshing: isFetching, // optional external signal
 * });
 *
 * // Use with RefreshControl
 * <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 * ```
 */
export function useRefresh({refresh, isRefreshing}: UseRefreshProps): UseRefreshReturn {
  const [refreshing, setRefreshing] = useState(false);
  const previousIsRefreshingRef = useRef<boolean | undefined>(isRefreshing);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // When isRefreshing transitions from true to false/undefined, set refreshing to false
  useEffect(() => {
    const previous = previousIsRefreshingRef.current;
    const current = isRefreshing;

    // Detect transition from true to false/undefined
    if (previous === true && (current === false || current === undefined)) {
      setRefreshing(false);
    }

    // Update ref for next comparison
    previousIsRefreshingRef.current = current;
  }, [isRefreshing]);

  return {
    refreshing,
    setRefreshing,
    onRefresh,
  };
}
