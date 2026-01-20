import {useCallback} from 'react';

/**
 * Checks if a search query is valid (meets minimum length requirements).
 *
 * This validation is necessary to prevent pagination and API calls when the search query
 * is empty or below the minimum required length. Without this check, FlashList's
 * `onEndReached` callback can fire even when there's no valid search query, causing
 * unwanted API calls with empty or invalid search parameters.
 *
 * @param searchQuery - The search query string to validate
 * @param minLength - The minimum required length for a valid search (default: 3)
 * @returns `true` if the trimmed query meets the minimum length requirement, `false` otherwise
 *
 * @example
 * ```tsx
 * const isValid = isSearchValid(searchQuery, 3);
 * if (isValid) {
 *   // Safe to perform search or pagination
 * }
 * ```
 */
export const isSearchValid = (searchQuery: string, minLength: number = 3): boolean => {
  return searchQuery.trim().length >= minLength;
};

/**
 * Hook that provides safe pagination utilities for search components.
 *
 * **Why this is necessary:**
 *
 * FlashList's `onEndReached` callback can fire even when there's no valid search query.
 * Additionally, React Query's `hasNextPage` may remain `true` from a previous search,
 * causing pagination to trigger on empty searches. This results in unwanted API calls
 * with empty/invalid search parameters.
 *
 * **Example problematic scenario:**
 * 1. User performs a search with results
 * 2. User clears the search query
 * 3. FlashList scrolls (or is already at bottom)
 * 4. `onEndReached` fires
 * 5. `fetchNextPage()` is called with empty search → unwanted API call
 *
 * **What this hook prevents:**
 * - Unnecessary API calls when search query is empty or below minimum length
 * - FlashList showing loading indicators when there's no valid search
 * - Potential errors from pagination attempts on invalid queries
 *
 * **Usage:**
 * ```tsx
 * const {safeHandleLoadNext, effectiveHasNextPage} = useSafePagination({
 *   searchQuery,
 *   minLength: 3,
 *   hasNextPage,
 *   itemsLength: items.length,
 *   fetchNextPage,
 * });
 *
 * // Use safeHandleLoadNext instead of calling fetchNextPage directly
 * <BoardgameFlatList
 *   handleLoadNext={safeHandleLoadNext}
 *   hasNextPage={effectiveHasNextPage}
 *   items={items}
 * />
 * ```
 *
 * **When to use `effectiveHasNextPage` vs `hasNextPage`:**
 * - Use `effectiveHasNextPage` when passing to list components (FlashList, FlatList)
 *   to prevent showing loading indicators when search is invalid
 * - Use `hasNextPage` from React Query only for internal logic that needs the raw value
 *
 * @param searchQuery - The current search query string
 * @param minLength - Minimum required length for a valid search (default: 3)
 * @param hasNextPage - The `hasNextPage` value from React Query's infinite query
 * @param itemsLength - The length of the current items array (used to determine if search has results)
 * @param fetchNextPage - The `fetchNextPage` function from React Query's infinite query
 * @returns An object containing:
 *   - `safeHandleLoadNext`: A wrapped version of `fetchNextPage` that only executes when search is valid
 *   - `effectiveHasNextPage`: A boolean that's `false` when search is invalid, preventing FlashList from triggering pagination
 */
export const useSafePagination = ({
  searchQuery,
  minLength = 3,
  hasNextPage,
  itemsLength,
  fetchNextPage,
}: {
  searchQuery: string;
  minLength?: number;
  hasNextPage: boolean;
  itemsLength: number;
  fetchNextPage: () => void;
}): {
  safeHandleLoadNext: () => void;
  effectiveHasNextPage: boolean;
} => {
  const searchIsValid = isSearchValid(searchQuery, minLength);

  const safeHandleLoadNext = useCallback(() => {
    // Only call fetchNextPage if search is valid and there's a next page
    if (searchIsValid && hasNextPage) {
      fetchNextPage();
    }
  }, [searchIsValid, hasNextPage, fetchNextPage]);

  // Ensure hasNextPage is false when search is invalid to prevent FlashList from triggering onEndReached
  // Also require that there are actual items (search has results) before allowing pagination
  const effectiveHasNextPage = searchIsValid && itemsLength > 0 && hasNextPage;

  return {
    safeHandleLoadNext,
    effectiveHasNextPage,
  };
};
