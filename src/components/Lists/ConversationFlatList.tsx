import {
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleSheet,
  View,
} from 'react-native';
import {FloatingScrollButton} from '../Buttons/FloatingScrollButton.tsx';
import {AppIcons} from '../../libraries/Enums/Icons.ts';
import React, {useCallback, useState} from 'react';
import {FloatingScrollButtonPosition} from '../../libraries/Types';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

interface ConversationFlatListProps<TItem> {
  scrollButtonPosition?: FloatingScrollButtonPosition;
  // scrollButtonIcon?: IconSource;
  // scrollButtonToTop?: boolean;
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
  renderListHeader: () => React.JSX.Element;
  renderListFooter: () => React.JSX.Element;
  renderItem: ListRenderItem<TItem>;
  data: ArrayLike<TItem>;
  renderItemSeparator?: React.ComponentType<any>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  maintainViewPosition?: boolean;
}

export const ConversationFlatList = <TItem,>({
  scrollButtonPosition,
  // scrollButtonIcon = AppIcons.scrollDown,
  invertList = true,
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
  maintainViewPosition = false,
}: // scrollButtonToTop = false,
ConversationFlatListProps<TItem>) => {
  const {commonStyles, styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);
  // const [contentHeight, setContentHeight] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);

  const styles = StyleSheet.create({
    flatList: {
      ...commonStyles.paddingHorizontal,
      ...(invertList ? commonStyles.verticallyInverted : undefined),
    },
    itemContainerView: {
      ...(invertList ? commonStyles.verticallyInverted : undefined),
    },
  });

  const handleScrollButtonPress = useCallback(() => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
    // if (invertList) {
    //   console.log('dunno yet');
    //   // offset: 0 is the bottom in an inverted list.
    //   flatListRef.current?.scrollToOffset({offset: 0, animated: true});
    //   // flatListRef.current?.scrollToOffset({offset: contentHeight, animated: true});
    // } else {
    //   flatListRef.current?.scrollToOffset({offset: 0, animated: true});
    // }
    // if (invertList || scrollButtonToTop) {
    //   console.log('[ConversationFlatList.tsx] scrolling to offset 0');
    //   flatListRef.current?.scrollToOffset({offset: 0, animated: true});
    // } else {
    //   console.log('[ConversationFlatList.tsx] scrolling to end');
    //   flatListRef.current?.scrollToOffset({offset: contentHeight, animated: true});
    // }
  }, [flatListRef]);

  // @TODO theres some logic wonk here.
  // inverted list = start at bottom
  // ForumThreadScreenBase, regular forum view: invert if unread
  // The rest is all Favorites, Your Posts, Users Posts, lists that should start
  // at the top.
  // event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold is true
  // when scrolled down from the top.
  // There's probably a case when you start mid-way down a thread.
  // If invertList is false, scroll up.
  // console.log(invertList, scrollButtonToTop);
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setShowScrollButton(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
      // console.log('Invert', event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
      // console.log(
      //   'Other',
      //   event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y >
      //     styleDefaults.listScrollThreshold * 2,
      // );
      // if (invertList) {
      //   console.log('idk yet');
      //   setShowScrollButton(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
      // } else {
      //   setShowScrollButton(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
      // }
      // if (invertList || scrollButtonToTop) {
      //   console.log('YES');
      //   setShowScrollButton(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
      // } else {
      //   console.log('NO');
      //   setShowScrollButton(
      //     event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y >
      //       styleDefaults.listScrollThreshold * 2,
      //   );
      // }
    },
    [styleDefaults.listScrollThreshold],
  );

  const onContentSizeChange = useCallback((w: number, h: number) => {
    // setContentHeight(h);
  }, []);

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
    (data: ArrayLike<TItem> | null | undefined, index: number) => ({
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

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItemInternal}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
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
        ListFooterComponent={invertList ? renderListHeader : renderListFooter}
        ListHeaderComponent={invertList ? renderListFooter : renderListHeader}
        ItemSeparatorComponent={renderItemSeparator}
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
