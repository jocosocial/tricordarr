import {
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {FloatingScrollButton} from '../Buttons/FloatingScrollButton.tsx';
import {AppIcons} from '../../libraries/Enums/Icons.ts';
import React, {useCallback, useState} from 'react';
import {FlatListSeparatorProps, FloatingScrollButtonPosition} from '../../libraries/Types';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

export interface ConversationFlatListProps<TItem> {
  scrollButtonPosition?: FloatingScrollButtonPosition;
  invertList?: boolean;
  flatListRef: React.RefObject<FlatList<TItem>>;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  handleLoadPrevious?: () => void;
  handleLoadNext?: () => void;
  onEndReachedThreshold?: number;
  onStartReachedThreshold?: number;
  keyExtractor?: (item: TItem, index: number) => string;
  initialScrollIndex?: number;
  renderListHeader?: React.ComponentType<any>;
  renderListFooter?: React.ComponentType<any>;
  renderItem: ListRenderItem<TItem>;
  data: ArrayLike<TItem>;
  renderItemSeparator?: React.ComponentType<any>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  maintainViewPosition?: boolean;
  onScrollThreshold?: (condition: boolean) => void;
  listStyle?: StyleProp<ViewStyle>;
}

export const ConversationFlatList = <TItem,>({
  scrollButtonPosition,
  invertList,
  flatListRef,
  hasNextPage,
  hasPreviousPage,
  handleLoadPrevious,
  handleLoadNext,
  onStartReachedThreshold = 1,
  onEndReachedThreshold = 1,
  keyExtractor,
  initialScrollIndex = 0,
  renderListHeader,
  renderListFooter,
  renderItem,
  renderItemSeparator,
  data,
  refreshControl,
  maintainViewPosition = true,
  onScrollThreshold,
  listStyle,
}: ConversationFlatListProps<TItem>) => {
  const {commonStyles, styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [itemHeights, setItemHeights] = useState<number[]>([]);

  const styles = StyleSheet.create({
    flatList: {
      ...(invertList ? commonStyles.verticallyInverted : undefined),
      ...(listStyle as ViewStyle),
    },
    itemContainerView: {
      ...(invertList ? commonStyles.verticallyInverted : undefined),
    },
  });

  /**
   * Callback handler for when the scroll button is pressed.
   * Used to track some state for the list contentHeight and would do
   * flatListRef.current?.scrollToOffset({offset: contentHeight, animated: true});
   */
  const handleScrollButtonPress = useCallback(() => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  }, [flatListRef]);

  /**
   * There are basically two types of list:
   * - Inverted: Things like read Forums and Seamail that start at the bottom.
   * - Uninverted: Things like unread Forums and LFG Lists that start at the top.
   *
   * At one point I had this, but it's not relevant anymore. Saving for later.
   *   event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y >
   *     styleDefaults.listScrollThreshold * 2,
   */
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollThresholdCondition = event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold;
      setShowScrollButton(scrollThresholdCondition);
      if (onScrollThreshold) {
        onScrollThreshold(scrollThresholdCondition);
      }
    },
    [onScrollThreshold, styleDefaults.listScrollThreshold],
  );

  /**
   * If the forum has been fully read and you only have the latest very small
   * page, it can leave the list in a situation where the onEndReached hook
   * never fires. This is particularly problematic in inverted lists because
   * you can be left with one or two posts and a header that says Loading.
   * So this jogs its memory. A potential future optimization can be to trigger
   * this only if the pageSize is small (like <=10).
   */
  const onLayout = useCallback(() => {
    if (invertList && hasPreviousPage && handleLoadPrevious) {
      handleLoadPrevious();
    } else if (!invertList && hasNextPage && handleLoadNext) {
      handleLoadNext();
    }
  }, [handleLoadNext, handleLoadPrevious, hasNextPage, hasPreviousPage, invertList]);

  const getItemHeight = useCallback(
    (index: number) => {
      return itemHeights[index] || 0;
    },
    [itemHeights],
  );

  // @TODO factor in separators.
  const getItemOffset = useCallback(
    (index: number) => {
      if (itemHeights[index] === undefined) {
        return 0;
      }
      return itemHeights.slice(0, index).reduce((previousValue, currentItem) => previousValue + currentItem, 0);
    },
    [itemHeights],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<TItem> | null | undefined, index: number) => ({
      length: getItemHeight(index),
      offset: getItemOffset(index),
      index,
    }),
    [getItemHeight, getItemOffset],
  );

  const renderItemInternal = useCallback(
    (renderItemProps: ListRenderItemInfo<TItem>) => {
      return (
        <View
          style={styles.itemContainerView}
          onLayout={event => {
            // Doing this without the variable blows up with a null value. Wonder
            // if the setter callback is resetting the event context? /shrug.
            const layout = event.nativeEvent.layout;
            // console.log(`index=${index}`, 'layout', layout, `post=${item.text.substring(0, 9)}`);
            setItemHeights(prevData => {
              return [...prevData, layout.height];
            });
          }}>
          {renderItem(renderItemProps)}
        </View>
      );
    },
    [renderItem, styles.itemContainerView],
  );

  const renderComponentInternal = useCallback(
    (inputComponent?: React.ComponentType<any>): React.ComponentType<any> | null | undefined => {
      // If it's a valid React element, render it directly
      // This currently does not do the FlatListSeparatorProps. Does it need to?
      if (React.isValidElement(inputComponent)) {
        return () => <View style={styles.itemContainerView}>{inputComponent}</View>;
      }
      if (typeof inputComponent === 'function') {
        // If it's a function (ComponentType or functional component), render it
        const RenderedComponent = inputComponent as React.ComponentType<any>;
        return ({highlighted, leadingItem}: FlatListSeparatorProps<TItem>) => (
          <View style={styles.itemContainerView}>
            <RenderedComponent highlighted={highlighted} leadingItem={leadingItem} />
          </View>
        );
      }
      console.error('Invalid component type provided to renderComponentInternal.');
      return null;
    },
    [styles.itemContainerView],
  );

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItemInternal}
        onScroll={onScroll}
        // With RN 0.72 if pageSize is too small this doesn't trigger onEndReached.
        // Page size bigger, just fine.
        // Encountered this with ForumPostFlatList and this time had a way around it.
        onLayout={onLayout}
        style={styles.flatList}
        onStartReachedThreshold={onStartReachedThreshold}
        onEndReachedThreshold={onEndReachedThreshold}
        keyExtractor={keyExtractor}
        onScrollToIndexFailed={info => console.warn('scroll failed', info)}
        // Just setting initialScrollIndex is causing the list to be empty. Allegedly this is
        // because FlatList skips rendering for invisible items.
        // disableVirtualization={true} made this work, though I feel like I'm going to
        // regret it at some point.
        initialScrollIndex={initialScrollIndex}
        disableVirtualization={true}
        getItemLayout={getItemLayout}
        onStartReached={invertList ? handleLoadNext : handleLoadPrevious}
        onEndReached={invertList ? handleLoadPrevious : handleLoadNext}
        ListFooterComponent={
          invertList ? renderComponentInternal(renderListHeader) : renderComponentInternal(renderListFooter)
        }
        ListHeaderComponent={
          invertList ? renderComponentInternal(renderListFooter) : renderComponentInternal(renderListHeader)
        }
        ItemSeparatorComponent={renderComponentInternal(renderItemSeparator)}
        refreshControl={refreshControl}
        maintainVisibleContentPosition={maintainViewPosition ? {minIndexForVisible: 0} : undefined}
      />
      {showScrollButton && (
        <FloatingScrollButton
          icon={invertList ? AppIcons.scrollDown : AppIcons.scrollUp}
          onPress={handleScrollButtonPress}
          displayPosition={scrollButtonPosition}
        />
      )}
    </>
  );
};
