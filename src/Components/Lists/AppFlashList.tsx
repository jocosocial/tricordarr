import {FlashList, type FlashListRef, ListRenderItem} from '@shopify/flash-list';
import React, {useCallback, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, StyleProp, ViewStyle} from 'react-native';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {FloatingScrollButtonPosition} from '#src/Types';

interface AppFlashListProps<TItem> {
  scrollButtonPosition?: FloatingScrollButtonPosition;
  invertList?: boolean;
  flatListRef: React.RefObject<FlashListRef<TItem>>;
  handleLoadNext?: () => void;
  onEndReachedThreshold?: number;
  onStartReachedThreshold?: number;
  keyExtractor?: (item: TItem, index: number) => string;
  initialScrollIndex?: number;
  renderListHeader?: React.ComponentType<any>;
  renderListFooter?: React.ComponentType<any>;
  renderItem: ListRenderItem<TItem>;
  data: TItem[];
  renderItemSeparator?: React.ComponentType<any>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  maintainViewPosition?: boolean;
  onScrollThreshold?: (condition: boolean) => void;
  listStyle?: StyleProp<ViewStyle>;
  enableScrollButton?: boolean;
  numColumns?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  columnWrapperStyle?: StyleProp<ViewStyle>;
  extraData?: any;
}

export const AppFlashList = <TItem,>({
  scrollButtonPosition,
  invertList,
  flatListRef,
  onEndReachedThreshold = 1,
  keyExtractor,
  initialScrollIndex = 0,
  renderListHeader,
  renderListFooter,
  renderItem,
  renderItemSeparator,
  data,
  refreshControl,
  onScrollThreshold,
  enableScrollButton = true,
  numColumns,
  handleLoadNext,
  extraData,
}: AppFlashListProps<TItem>) => {
  const {styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);

  /**
   * Callback handler for when the scroll button is pressed.
   * Used to track some state for the list contentHeight and would do
   * flatListRef.current?.scrollToOffset({offset: contentHeight, animated: true});
   */
  const handleScrollButtonPress = useCallback(() => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  }, [flatListRef]);

  /**
   * Show the scroll button when a certain scroll threshold has been hit.
   * Allows for a callback to be triggered on that same threshold.
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

  console.log('[AppFlashList.tsx] Rendering AppFlashList at', new Date());

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlashList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        onScroll={enableScrollButton ? onScroll : undefined}
        onEndReachedThreshold={onEndReachedThreshold}
        keyExtractor={keyExtractor}
        initialScrollIndex={initialScrollIndex}
        ListFooterComponent={renderListFooter}
        ListHeaderComponent={renderListHeader}
        ItemSeparatorComponent={renderItemSeparator}
        refreshControl={refreshControl}
        numColumns={numColumns}
        onEndReached={handleLoadNext}
        extraData={extraData}
      />
      {enableScrollButton && showScrollButton && (
        <FloatingScrollButton
          icon={invertList ? AppIcons.scrollDown : AppIcons.scrollUp}
          onPress={handleScrollButtonPress}
          displayPosition={scrollButtonPosition}
        />
      )}
    </>
  );
};
