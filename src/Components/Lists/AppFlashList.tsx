import {FlashList, type FlashListRef, ListRenderItem} from '@shopify/flash-list';
import React, {forwardRef, useCallback, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, StyleProp, View, ViewStyle} from 'react-native';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
interface AppFlashListProps<TItem> {
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
    scrollButtonSmall,
    onEndReachedThreshold = 1,
    keyExtractor,
    /** 0 == first item, undefined == start, including header */
    initialScrollIndex,
    renderListHeader,
    renderListFooter,
    renderItem,
    renderItemSeparator,
    data,
    refreshControl,
    onScrollThreshold,
    enableScrollButton,
    numColumns,
    handleLoadNext,
    extraData,
    style,
    masonry = false,
  }: AppFlashListProps<TItem>,
  ref: React.ForwardedRef<FlashListRef<TItem>>,
) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  const effectiveScrollButton = enableScrollButton ?? appConfig.userPreferences.showScrollButton;
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
    <View style={commonStyles.flex}>
      <FlashList
        ref={ref}
        data={data}
        renderItem={renderItem}
        onScroll={effectiveScrollButton ? onScroll : undefined}
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
      {effectiveScrollButton && showScrollButton && (
        <FloatingScrollButton icon={AppIcons.scrollUp} onPress={handleScrollButtonPress} small={scrollButtonSmall} />
      )}
    </View>
  );
};

export const AppFlashList = forwardRef(AppFlashListInner) as <TItem>(
  props: AppFlashListProps<TItem> & {ref?: React.ForwardedRef<FlashListRef<TItem>>},
) => ReturnType<typeof AppFlashListInner>;
