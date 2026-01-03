import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {ContentText} from '#src/Components/Text/ContentText';
import {SearchableMarkdownText} from '#src/Components/Text/SearchableMarkdownText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

interface MarkdownScreenBaseProps {
  data: string | undefined;
  refetch: () => void;
  isFetching: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  footer?: ReactElement;
  navigation?: {
    setOptions: (options: any) => void;
  };
  scrollViewStyle?: object;
  actionsMenu?: ReactElement;
}

/**
 * Base component for screens that display markdown content.
 * Supports optional search functionality and footer content.
 *
 * Cursor generated, mostly.
 */
export const MarkdownScreenBase = ({
  data,
  refetch,
  isFetching,
  enableSearch = false,
  searchPlaceholder = 'Search',
  footer,
  navigation,
  scrollViewStyle,
  actionsMenu,
}: MarkdownScreenBaseProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [highlightedMatchIndex, setHighlightedMatchIndex] = useState<number | undefined>(undefined);
  const scrollViewRef = useRef<ScrollView>(null);
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  // Filter search query to only allow 2+ characters - only use submitted query
  const effectiveSearchQuery = React.useMemo(() => {
    if (!enableSearch || !submittedSearchQuery) return '';
    const trimmed = submittedSearchQuery.trim();
    return trimmed.length >= 2 ? trimmed : '';
  }, [submittedSearchQuery, enableSearch]);

  // Calculate match count
  const matchCount = React.useMemo(() => {
    if (!enableSearch || !effectiveSearchQuery || !data) {
      return 0;
    }
    const markdownIdentifier = '<Markdown>';
    const processed = data.replace(markdownIdentifier, '').trim();
    const regex = new RegExp(effectiveSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = Array.from(processed.matchAll(regex));
    return matches.length;
  }, [data, effectiveSearchQuery, enableSearch]);

  const styles = StyleSheet.create({
    button: {
      ...commonStyles.onSurfaceVariant,
      flexShrink: 0,
    },
    container: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.surfaceVariant,
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.minHeightLarge,
      ...commonStyles.alignItemsCenter,
      flexWrap: 'nowrap',
    },
    noResultsText: {
      ...commonStyles.onSurfaceVariant,
    },
    scrollView: {
      ...commonStyles.marginTopSmall,
      ...scrollViewStyle,
    },
  });

  const handleSearch = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 2) {
      setSubmittedSearchQuery(trimmed);
      setIsSearchActive(true);
      setHighlightedMatchIndex(0);
      Keyboard.dismiss();
    }
  }, [searchQuery]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSubmittedSearchQuery('');
    setIsSearchActive(false);
    setHighlightedMatchIndex(undefined);
  }, []);

  const scrollToMatch = useCallback(
    (matchIndex: number) => {
      if (!data || !effectiveSearchQuery || matchCount === 0) return;

      const markdownIdentifier = '<Markdown>';
      const processed = data.replace(markdownIdentifier, '').trim();
      const regex = new RegExp(effectiveSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = Array.from(processed.matchAll(regex));

      if (matchIndex >= matches.length) return;

      const match = matches[matchIndex];
      if (match.index === undefined) return;

      // Estimate scroll position based on character position
      // This is a rough estimate - for more accuracy, we'd need to measure actual positions
      const estimatedLineHeight = 20; // Approximate line height
      const charsPerLine = 50; // Approximate characters per line
      const estimatedOffset = (match.index / charsPerLine) * estimatedLineHeight;

      scrollViewRef.current?.scrollTo({
        y: Math.max(0, estimatedOffset - 100), // Offset by 100px to show context
        animated: true,
      });
    },
    [data, effectiveSearchQuery, matchCount],
  );

  const handleNextMatch = useCallback(() => {
    if (matchCount === 0) return;
    Keyboard.dismiss();
    setHighlightedMatchIndex(prev => {
      const next = prev === undefined ? 0 : (prev + 1) % matchCount;
      scrollToMatch(next);
      return next;
    });
  }, [matchCount, scrollToMatch]);

  const handlePreviousMatch = useCallback(() => {
    if (matchCount === 0) return;
    Keyboard.dismiss();
    setHighlightedMatchIndex(prev => {
      const next = prev === undefined ? matchCount - 1 : (prev - 1 + matchCount) % matchCount;
      scrollToMatch(next);
      return next;
    });
  }, [matchCount, scrollToMatch]);

  const getNavButtons = useCallback(() => {
    if (!navigation && !actionsMenu) return null;
    const hasSearch = enableSearch && navigation;
    const hasMenu = actionsMenu !== undefined;
    if (!hasSearch && !hasMenu) return null;

    return (
      <View>
        <MaterialHeaderButtons>
          {hasSearch && (
            <Item
              title={'Search'}
              iconName={AppIcons.search}
              onPress={() => {
                setIsSearchActive(true);
              }}
            />
          )}
          {actionsMenu}
        </MaterialHeaderButtons>
      </View>
    );
  }, [enableSearch, navigation, actionsMenu]);

  useEffect(() => {
    if (navigation && (enableSearch || actionsMenu)) {
      navigation.setOptions({
        headerRight: getNavButtons,
      });
    }
  }, [getNavButtons, navigation, enableSearch, actionsMenu]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {isSearchActive && enableSearch && (
        <>
          <SearchBarBase
            searchQuery={searchQuery}
            onClear={handleClear}
            onSearch={handleSearch}
            onChangeSearch={setSearchQuery}
            placeholder={searchPlaceholder}
            minLength={2}
            style={commonStyles.marginBottomSmall}
          />
          {effectiveSearchQuery.length > 0 && (
            <View style={styles.container}>
              {matchCount > 0 ? (
                <>
                  <Button
                    icon={AppIcons.scrollUp}
                    mode={'text'}
                    style={styles.button}
                    textColor={theme.colors.onBackground}
                    onPress={handlePreviousMatch}
                    disabled={highlightedMatchIndex === 0 || highlightedMatchIndex === undefined}>
                    Previous
                  </Button>
                  <Button mode={'text'} style={styles.button} textColor={theme.colors.onBackground} disabled>
                    {highlightedMatchIndex !== undefined
                      ? `${(highlightedMatchIndex ?? 0) + 1} / ${matchCount}`
                      : `0 / ${matchCount}`}
                  </Button>
                  <Button
                    icon={AppIcons.scrollDown}
                    mode={'text'}
                    style={styles.button}
                    textColor={theme.colors.onBackground}
                    onPress={handleNextMatch}
                    disabled={highlightedMatchIndex === matchCount - 1}>
                    Next
                  </Button>
                </>
              ) : (
                <Text style={styles.noResultsText}>No results found</Text>
              )}
            </View>
          )}
        </>
      )}
      <ScrollingContentView
        ref={scrollViewRef}
        refreshControl={<AppRefreshControl refreshing={isFetching} onRefresh={refetch} />}
        isStack={true}
        style={styles.scrollView}>
        <PaddedContentView>
          {enableSearch ? (
            <SearchableMarkdownText
              text={data}
              searchQuery={effectiveSearchQuery}
              highlightedMatchIndex={highlightedMatchIndex}
            />
          ) : (
            <ContentText text={data} forceMarkdown={true} />
          )}
        </PaddedContentView>
        {footer}
      </ScrollingContentView>
    </AppView>
  );
};
