import React, {useEffect} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
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
  remove?: () => void;
  /**
   * If true, automatically triggers onSearch when the query meets minLength requirements.
   * Useful for reactive search patterns where results update as the user types.
   */
  autoSearch?: boolean;
}

export const SearchBarBase = ({
  onSearch,
  onChangeSearch,
  searchQuery,
  onClear,
  placeholder = 'Search',
  minLength = 3,
  style,
  remove,
  autoSearch = false,
}: SearchBarBaseProps) => {
  const {commonStyles} = useStyles();
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
  // @TODO react query v5 removed remove(). Is this still relevant? Should we do something else?
  useEffect(() => {
    return () => (remove ? remove() : undefined);
  }, [remove]);

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
        onClearIconPress={onClear}
        style={styles.searchBar}
      />
      {showHelp && <HelperText type={'error'}>{`Must enter >${minLength - 1} characters to search`}</HelperText>}
    </>
  );
};
