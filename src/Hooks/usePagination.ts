import {useCallback} from 'react';

export interface UsePaginationProps {
  fetchNextPage: () => Promise<any>;
  fetchPreviousPage?: () => Promise<any>;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  isFetchingNextPage?: boolean;
  isFetchingPreviousPage?: boolean;
  setRefreshing?: (value: boolean) => void;
}

export interface UsePaginationReturn {
  handleLoadNext: () => Promise<void>;
  handleLoadPrevious?: () => Promise<void>;
}

/**
 * Hook to manage pagination for React Query infinite queries.
 *
 * Encapsulates the common pattern of handling next/previous page loading with proper
 * guards against duplicate calls and optional refreshing state management.
 *
 * @param props - Configuration props
 * @param props.fetchNextPage - Async function to fetch the next page (required)
 * @param props.fetchPreviousPage - Async function to fetch the previous page (optional)
 * @param props.hasNextPage - Whether there is a next page available
 * @param props.hasPreviousPage - Whether there is a previous page available
 * @param props.isFetchingNextPage - Whether the next page is currently being fetched
 * @param props.isFetchingPreviousPage - Whether the previous page is currently being fetched
 * @param props.setRefreshing - Optional callback to manage refreshing state during pagination
 *
 * @returns An object with handleLoadNext and optionally handleLoadPrevious async functions
 *
 * @example
 * ```ts
 * const {handleLoadNext, handleLoadPrevious} = usePagination({
 *   fetchNextPage,
 *   fetchPreviousPage,
 *   hasNextPage,
 *   hasPreviousPage,
 *   isFetchingNextPage,
 *   isFetchingPreviousPage,
 *   setRefreshing, // optional
 * });
 *
 * // Use with list components
 * <AppFlashList handleLoadNext={handleLoadNext} handleLoadPrevious={handleLoadPrevious} />
 * ```
 */
export function usePagination({
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  setRefreshing,
}: UsePaginationProps): UsePaginationReturn {
  const handleLoadNext = useCallback(async () => {
    if (!isFetchingNextPage && hasNextPage) {
      if (setRefreshing) {
        setRefreshing(true);
        try {
          await fetchNextPage();
        } finally {
          setRefreshing(false);
        }
      } else {
        await fetchNextPage();
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, setRefreshing]);

  const handleLoadPrevious = useCallback(async () => {
    if (fetchPreviousPage && !isFetchingPreviousPage && hasPreviousPage) {
      if (setRefreshing) {
        setRefreshing(true);
        try {
          await fetchPreviousPage();
        } finally {
          setRefreshing(false);
        }
      } else {
        await fetchPreviousPage();
      }
    }
  }, [fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage, setRefreshing]);

  return {
    handleLoadNext,
    ...(fetchPreviousPage && {handleLoadPrevious}),
  };
}
