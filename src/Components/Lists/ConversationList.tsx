import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import Animated, {scrollTo, useAnimatedRef} from 'react-native-reanimated';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FloatingScrollButtonVerticalPosition, RNFlatListSeparatorComponent} from '#src/Types';

const INITIAL_RENDER_DELAY_MS = 75;
const REVEAL_POLL_INTERVAL_MS = 32;
const REVEAL_MAX_ATTEMPTS = 30;
const REVEAL_STABLE_TICKS = 2;

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  initialOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export type TConversationListRef = FlatList<any> | null;
export type TConversationListRefObject<TItem = any> = React.RefObject<FlatList<TItem> | null>;

export interface ConversationListRenderItemProps<TItem> {
  item: TItem;
  index: number;
  data: ReadonlyArray<TItem>;
  type?: string | number;
  extraData?: unknown;
}

interface ConversationListProps<TItem> {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  listRef: TConversationListRefObject<TItem>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  renderItem: (props: ConversationListRenderItemProps<TItem>) => React.ReactElement | null;
  data: TItem[];
  onScrollThreshold?: (condition: boolean) => void;
  enableScrollButton?: boolean;
  keyExtractor: (item: TItem) => string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ItemSeparatorComponent?: RNFlatListSeparatorComponent<TItem>;
  initialScrollIndex?: number;
  style?: StyleProp<ViewStyle>;
  scrollButtonVerticalPosition?: FloatingScrollButtonVerticalPosition;
}

/**
 * A chat-style conversation.
 */
export const ConversationList = <TItem,>({
  // hasPreviousPage,
  listRef,
  data,
  refreshControl,
  handleLoadPrevious,
  handleLoadNext,
  // hasNextPage,
  onScrollThreshold,
  enableScrollButton = true,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  initialScrollIndex,
  style,
  scrollButtonVerticalPosition = 'raised',
}: ConversationListProps<TItem>) => {
  const {styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasLayout, setHasLayout] = useState(false);
  const {appConfig} = useConfig();
  const animatedListRef = useAnimatedRef<FlatList<TItem>>();
  const hasPerformedInitialScrollRef = useRef(false);
  const prevContentHeightRef = useRef(0);
  const isAtBottomRef = useRef(true);
  const topThresholdTriggeredRef = useRef(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isInitialRenderReady, setIsInitialRenderReady] = useState(false);

  /**
   * Callback handler for when the scroll button is pressed.
   * Used to track some state for the list contentHeight and would do
   * flatListRef.current?.scrollToOffset({offset: contentHeight, animated: true});
   * Not anymore.
   *
   * animated: true seems to improve some performance in the simulator, idk if it matters
   * in real life.
   */
  const handleScrollButtonPress = useCallback(() => {
    listRef.current?.scrollToEnd({animated: true});
  }, [listRef]);

  const setListRefs = useCallback(
    (node: FlatList<TItem> | null) => {
      listRef.current = node;
      animatedListRef.current = node;
    },
    [animatedListRef, listRef],
  );

  /**
   * There are basically two types of list:
   * - Inverted: Things like read Forums and Seamail that start at the bottom.
   * - Uninverted: Things like unread Forums and LFG Lists that start at the top.
   *
   * At one point I had this, but it's not relevant anymore. Saving for later.
   *   event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y >
   *     styleDefaults.listScrollThreshold * 2,
   */
  const revealListWhenSettled = useCallback(() => {
    if (isInitialRenderReady) {
      return;
    }
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }

    let attempts = 0;
    let stableTicks = 0;

    const evaluate = () => {
      if (isAtBottomRef.current) {
        stableTicks += 1;
      } else {
        stableTicks = 0;
      }

      if (stableTicks >= REVEAL_STABLE_TICKS || attempts >= REVEAL_MAX_ATTEMPTS) {
        setIsInitialRenderReady(true);
        revealTimeoutRef.current = null;
        return;
      }

      attempts += 1;
      revealTimeoutRef.current = setTimeout(evaluate, REVEAL_POLL_INTERVAL_MS);
    };

    revealTimeoutRef.current = setTimeout(evaluate, INITIAL_RENDER_DELAY_MS);
  }, [isInitialRenderReady]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      const scrollThresholdCondition = distanceFromBottom > styleDefaults.listScrollThreshold;
      isAtBottomRef.current = distanceFromBottom <= styleDefaults.listScrollThreshold;
      setShowScrollButton(scrollThresholdCondition);
      if (onScrollThreshold) {
        onScrollThreshold(scrollThresholdCondition);
      }

      if (handleLoadPrevious) {
        const nearTop = contentOffset.y <= styleDefaults.listScrollThreshold;
        if (nearTop && !topThresholdTriggeredRef.current) {
          topThresholdTriggeredRef.current = true;
          handleLoadPrevious();
        } else if (!nearTop) {
          topThresholdTriggeredRef.current = false;
        }
      }
    },
    [handleLoadPrevious, onScrollThreshold, styleDefaults.listScrollThreshold],
  );

  const onLayout = useCallback(() => {
    if (!hasLayout) setHasLayout(true);
  }, [hasLayout]);

  const forceScrollToEnd = useCallback(
    (animated: boolean, options?: {shouldReveal?: boolean}) => {
      if (!listRef.current) {
        return;
      }

      const finalizeReady = () => {
        if (options?.shouldReveal) {
          revealListWhenSettled();
        }
      };

      const performScroll = () => {
        if (typeof initialScrollIndex === 'number') {
          try {
            listRef.current?.scrollToIndex({index: initialScrollIndex, animated});
            return;
          } catch (error) {
            console.warn('[ConversationList.tsx] scrollToIndex failed, falling back to scrollToEnd', error);
          }
        }
        listRef.current?.scrollToEnd({animated});
      };

      performScroll();
      requestAnimationFrame(performScroll);
      setTimeout(() => {
        performScroll();
        finalizeReady();
      }, 80);
      InteractionManager.runAfterInteractions(() => {
        performScroll();
        finalizeReady();
      });
    },
    [initialScrollIndex, listRef, revealListWhenSettled],
  );

  const onContentSizeChange = useCallback(
    (_: number, height: number) => {
      if (!data || data.length === 0) {
        prevContentHeightRef.current = 0;
        setIsInitialRenderReady(true);
        return;
      }

      if (isAtBottomRef.current && height > prevContentHeightRef.current) {
        forceScrollToEnd(true);
      }

      prevContentHeightRef.current = height;
    },
    [data, forceScrollToEnd],
  );

  const handleEndReached = useCallback(() => {
    if (handleLoadNext) {
      handleLoadNext();
    }
  }, [handleLoadNext]);

  const renderFlatListItem = useCallback(
    ({item, index}: ListRenderItemInfo<TItem>) =>
      renderItem({
        item,
        index,
        data,
      }),
    [data, renderItem],
  );

  const onScrollToIndexFailed = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({animated: false});
    });
  }, [listRef]);

  React.useEffect(() => {
    if (hasPerformedInitialScrollRef.current) return;
    if (!hasLayout) return;
    if (!data || data.length === 0) return;

    hasPerformedInitialScrollRef.current = true;
    forceScrollToEnd(false, {shouldReveal: true});
  }, [data, forceScrollToEnd, hasLayout]);

  React.useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const listStyle = useMemo<StyleProp<ViewStyle>>(
    () => [{opacity: isInitialRenderReady ? 1 : 0}, style],
    [isInitialRenderReady, style],
  );
  const shouldShowScrollButton = enableScrollButton && showScrollButton && isInitialRenderReady;
  const overlayStyle = useMemo<StyleProp<ViewStyle>>(
    () => [styles.initialOverlay, {backgroundColor: appConfig.accessibility.darkMode ? '#000000' : '#ffffff'}],
    [appConfig.accessibility.darkMode],
  );

  useKeyboardHandler(
    {
      onStart: e => {
        'worklet';
        if (e.height > 0) {
          scrollTo(animatedListRef, 0, 1e7, false);
        }
      },
      onMove: e => {
        'worklet';
        if (e.height > 0) {
          scrollTo(animatedListRef, 0, 1e7, false);
        }
      },
      onEnd: e => {
        'worklet';
        if (e.height > 0) {
          scrollTo(animatedListRef, 0, 1e7, false);
        }
      },
    },
    [animatedListRef],
  );

  return (
    <>
      <View style={styles.listWrapper}>
        <Animated.FlatList<TItem>
          ref={setListRefs}
          data={data}
          renderItem={renderFlatListItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListFooterComponent={ListFooterComponent}
          refreshControl={refreshControl}
          keyboardDismissMode={'on-drag'}
          keyboardShouldPersistTaps={'handled'}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          onScroll={onScroll}
          onLayout={onLayout}
          onContentSizeChange={onContentSizeChange}
          onScrollToIndexFailed={onScrollToIndexFailed}
          maintainVisibleContentPosition={{minIndexForVisible: 0}}
          style={listStyle}
          scrollEventThrottle={16}
        />
        {!isInitialRenderReady && (
          <View pointerEvents={'none'} style={overlayStyle}>
            <ActivityIndicator />
          </View>
        )}
      </View>
      {shouldShowScrollButton && (
        <FloatingScrollButton
          onPress={handleScrollButtonPress}
          verticalPosition={scrollButtonVerticalPosition}
          horizontalPosition={appConfig.userPreferences.reverseSwipeOrientation ? 'left' : 'right'}
        />
      )}
    </>
  );
};
