import {Query, useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {HelperText, Searchbar} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

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

interface SearchBarBaseProps {
  onSearch?: () => void;
  onChangeSearch?: (query: string) => void;
  searchQuery: string;
  onClear?: () => void;
  placeholder?: string;
  minLength?: number;
  style?: ViewStyle;
  /**
   * If true, automatically triggers onSearch when the query meets minLength requirements.
   * Useful for reactive search patterns where results update as the user types.
   */
  autoSearch?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const SearchBarBase = ({
  onSearch,
  onChangeSearch,
  searchQuery,
  onClear,
  placeholder = 'Search',
  minLength = 3,
  style,
  autoSearch = false,
  autoCapitalize = 'none',
}: SearchBarBaseProps) => {
  const {commonStyles} = useStyles();
  const queryClient = useQueryClient();
  const [showHelp, setShowHelp] = React.useState(false);

  const styles = StyleSheet.create({
    searchBar: {
      ...commonStyles.marginTopSmall,
      ...commonStyles.marginHorizontalSmall,
      ...style,
    },
  });

  const attemptSearch = () => {
    const trimmedQuery = searchQuery.trim();

    // Validate the trimmed query meets minimum length
    if (trimmedQuery.length < minLength) {
      setShowHelp(true);
      return;
    }

    setShowHelp(false);

    // If query needs trimming, update it first
    if (trimmedQuery !== searchQuery && onChangeSearch) {
      onChangeSearch(trimmedQuery);
    }

    // Execute the search
    // The parent's searchQuery state will already be updated with the trimmed value
    if (onSearch) {
      onSearch();
    }
  };

  const onIconPress = () => {
    attemptSearch();
  };

  /**
   * Clear search results from cache when query is cleared or component unmounts
   * Automatically detects and clears all queries with a 'search' parameter or user search endpoints
   * Query keys are structured as [endpoint, queryParams, ...queryKeyExtraData]
   * We match queries where:
   * 1. queryParams (2nd element) has a 'search' property, OR
   * 2. endpoint (1st element) matches user search endpoints (/users/match/allnames/ or /users/find/)
   *
   * This is some AI stuff.
   */
  const clearSearchCache = useCallback(() => {
    const predicate = (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
      const key = query.queryKey;
      if (key.length === 0) {
        return false;
      }

      // Check endpoint (first element) for user search endpoints
      const endpoint = key[0];
      if (typeof endpoint === 'string') {
        if (endpoint.startsWith('/users/match/allnames/') || endpoint.startsWith('/users/find/')) {
          return true;
        }
      }

      // Check if query key has at least 2 elements (endpoint and queryParams)
      // and queryParams has a 'search' property
      if (key.length >= 2 && typeof key[1] === 'object' && key[1] !== null) {
        const queryParams = key[1] as Record<string, unknown>;
        return 'search' in queryParams && queryParams.search !== undefined && queryParams.search !== '';
      }

      return false;
    };

    // Get all matching queries to log them before removal
    const queryCache = queryClient.getQueryCache();
    const matchingQueries = queryCache.findAll({predicate});
    const removedKeys = matchingQueries.map(query => query.queryKey);

    if (removedKeys.length > 0) {
      console.log('[SearchBarBase] Removing search query keys from cache:', removedKeys);
    }

    queryClient.removeQueries({predicate});
  }, [queryClient]);

  // Handle auto-search: trigger search automatically when query meets minLength
  // Also manage helper text visibility for reactive search patterns
  useEffect(() => {
    if (autoSearch) {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length >= minLength) {
        setShowHelp(false);
        // Call onSearch if provided (for explicit search triggers)
        // If not provided, the query hook will handle reactive searching
        if (onSearch) {
          onSearch();
        }
      } else if (trimmedQuery.length > 0 && trimmedQuery.length < minLength) {
        setShowHelp(true);
      } else {
        setShowHelp(false);
      }
    }
  }, [autoSearch, onSearch, searchQuery, minLength]);

  // Clear search results when you go back or otherwise unmount this screen
  // React Query v5: use queryClient.removeQueries() instead of the removed remove() method
  useEffect(() => {
    return () => {
      clearSearchCache();
    };
  }, [clearSearchCache]);

  // Clear cache when search is cleared via the clear button
  const handleClear = useCallback(() => {
    clearSearchCache();
    if (onClear) {
      onClear();
    }
  }, [clearSearchCache, onClear]);

  return (
    <>
      <Searchbar
        placeholder={placeholder}
        onIconPress={autoSearch ? undefined : onIconPress}
        onChangeText={onChangeSearch}
        value={searchQuery}
        onSubmitEditing={() => {
          attemptSearch();
        }}
        onClearIconPress={handleClear}
        style={styles.searchBar}
        autoCapitalize={autoCapitalize}
      />
      {showHelp && <HelperText type={'error'}>{`Must enter >${minLength - 1} characters to search`}</HelperText>}
    </>
  );
};
