import {FlashList, type FlashListRef, ListRenderItem} from '@shopify/flash-list';
import React, {forwardRef, useCallback, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, StyleProp, ViewStyle} from 'react-native';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {FloatingScrollButtonHorizontalPosition, FloatingScrollButtonVerticalPosition} from '#src/Types';

interface AppFlashListProps<TItem> {
  scrollButtonVerticalPosition?: FloatingScrollButtonVerticalPosition;
  scrollButtonHorizontalPosition?: FloatingScrollButtonHorizontalPosition;
  invertList?: boolean;
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
  extraData?: any;
  style?: ViewStyle;
  scrollButtonSmall?: boolean;
  masonry?: boolean;
}

const AppFlashListInner = <TItem,>(
  {
    scrollButtonVerticalPosition,
    scrollButtonHorizontalPosition,
    scrollButtonSmall,
    invertList,
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
    style,
    masonry = false,
  }: AppFlashListProps<TItem>,
  ref: React.ForwardedRef<FlashListRef<TItem>>,
) => {
  const {styleDefaults} = useStyles();
  const [showScrollButton, setShowScrollButton] = useState(false);

  /**
   * Callback handler for when the scroll button is pressed.
   * Used to track some state for the list contentHeight and would do
   * ref.current?.scrollToOffset({offset: contentHeight, animated: true});
   */
  const handleScrollButtonPress = useCallback(() => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.scrollToOffset({offset: 0, animated: true});
    }
  }, [ref]);

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

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlashList
        ref={ref}
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
        style={style}
        // columnWrapperStyle is not supported in FlashList v2.
        masonry={masonry}
      />
      {enableScrollButton && showScrollButton && (
        <FloatingScrollButton
          icon={invertList ? AppIcons.scrollDown : AppIcons.scrollUp}
          onPress={handleScrollButtonPress}
          verticalPosition={scrollButtonVerticalPosition}
          horizontalPosition={scrollButtonHorizontalPosition}
          small={scrollButtonSmall}
        />
      )}
    </>
  );
};

export const AppFlashList = forwardRef(AppFlashListInner) as <TItem>(
  props: AppFlashListProps<TItem> & {ref?: React.ForwardedRef<FlashListRef<TItem>>},
) => ReturnType<typeof AppFlashListInner>;
