import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View} from 'react-native';

import {ListItem} from '#src/Components/Lists/ListItem';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {MenuScrollIndicator} from '#src/Components/Views/MenuScrollIndicator';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {searchLabels, ShipSearchResult} from '#src/Libraries/ShipIndex';
import {ShipIndex} from '#src/Structs/ShipStructs';

interface MapSearchBarProps {
  visible: boolean;
  index: ShipIndex | undefined;
  onSelectResult: (result: ShipSearchResult) => void;
}

// Cap on the search results panel's height, in points, before it scrolls
// instead of growing further. Sized to content up to this cap (see
// resultsContentHeight below) rather than always reserving this much space —
// a plain percentage-of-screen maxHeight leaves blank space under a couple
// of results, which is the "wasted space" AppMenu's own results list avoids.
const MAX_RESULTS_HEIGHT = 320;

/**
 * Floating search bar for MapScreen: an absolutely-positioned sibling of the
 * scrollable deck content, not part of it (see the comment at its call site) —
 * so this stays visible regardless of where the user has scrolled to.
 */
export const MapSearchBar = ({visible, index, onSelectResult}: MapSearchBarProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [resultsContentHeight, setResultsContentHeight] = useState(0);
  const [resultsAtBottom, setResultsAtBottom] = useState(false);

  const resultsScrollRef = useRef<ScrollView>(null);

  const searchResults: ShipSearchResult[] = useMemo(() => searchLabels(index, searchQuery), [index, searchQuery]);

  // A fresh set of results should start scrolled to top, not carry over
  // "at bottom" from whatever the previous query's results looked like.
  useEffect(() => {
    setResultsAtBottom(false);
  }, [searchResults]);

  const onSearchClear = useCallback(() => setSearchQuery(''), []);

  const onResultsScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const maxScrollY = contentSize.height - layoutMeasurement.height;
    setResultsAtBottom(contentOffset.y >= maxScrollY - 5);
  }, []);

  const isResultsScrollable = resultsContentHeight > MAX_RESULTS_HEIGHT;
  const showResultsScrollIndicator = isResultsScrollable && !resultsAtBottom;

  const styles = StyleSheet.create({
    searchOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.paddingBottomSmall,
    },
    searchResultsContainer: {
      position: 'relative',
    },
    searchResults: {
      // Sized to the actual content up to the cap, not always the cap itself —
      // a bare maxHeight here reserves that much blank space under a couple
      // of results, same as AppMenu was written to avoid.
      maxHeight: Math.min(resultsContentHeight, MAX_RESULTS_HEIGHT),
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.searchOverlay}>
      <SearchBarBase
        testID={'mapSearch-input'}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onClear={onSearchClear}
        autoSearch={true}
        minLength={2}
        placeholder={'Search venues and staterooms'}
      />
      <View style={styles.searchResultsContainer}>
        <ScrollView
          ref={resultsScrollRef}
          style={styles.searchResults}
          scrollEnabled={isResultsScrollable}
          onContentSizeChange={(_w, h) => setResultsContentHeight(h)}
          onScroll={onResultsScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps={'handled'}>
          {searchResults.map(result => (
            <ListItem
              key={`${result.deckNumber}:${result.key}`}
              title={result.name}
              description={`Deck ${result.deckNumber}`}
              onPress={() => onSelectResult(result)}
            />
          ))}
        </ScrollView>
        <MenuScrollIndicator
          visible={showResultsScrollIndicator}
          onPress={() => resultsScrollRef.current?.scrollToEnd()}
        />
      </View>
    </View>
  );
};
