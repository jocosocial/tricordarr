import {Query, useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect} from 'react';
import {Keyboard, StyleSheet, ViewStyle} from 'react-native';
import {HelperText, Searchbar} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

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
    Keyboard.dismiss();
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

  // Manage helper text visibility for auto-search patterns.
  // The query hook handles the actual searching reactively via searchQuery state.
  // Do NOT dismiss the keyboard here — this effect fires on every keystroke.
  useEffect(() => {
    if (autoSearch) {
      const trimmedQuery = searchQuery.trim();
      setShowHelp(trimmedQuery.length > 0 && trimmedQuery.length < minLength);
    }
  }, [autoSearch, searchQuery, minLength]);

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
