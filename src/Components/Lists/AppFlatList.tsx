import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import {FloatingScrollButton} from '#src/Components/Buttons/FloatingScrollButton';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {MaintainVisibleContentPosition} from '#src/Types/Lists';

interface AppFlatListProps<TItem> {
  handleLoadNext?: () => void;
  onEndReachedThreshold?: number;
  keyExtractor?: (item: TItem, index: number) => string;
  initialScrollIndex?: number;
  renderListHeader?: React.ComponentType<any>;
  renderListFooter?: React.ComponentType<any>;
  renderItem: ListRenderItem<TItem>;
  data: TItem[];
  renderItemSeparator?: React.ComponentType<any>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /**
   * Same shape as AppFlashList's prop. `disabled: true` omits the prop entirely (FlatList has no
   * such flag; it is off unless a value is passed).
   */
  maintainVisibleContentPosition?: MaintainVisibleContentPosition;
  onScrollThreshold?: (condition: boolean) => void;
  enableScrollButton?: boolean;
  numColumns?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraData?: any;
  style?: ViewStyle;
  scrollButtonSmall?: boolean;
}

/**
 * Drop-in counterpart to AppFlashList backed by React Native's FlatList instead of Shopify's
 * FlashList. Takes the same props (minus `masonry`, which FlatList can't do) and renders the same
 * floating scroll button, so a list can be switched between the two by changing the component and
 * the ref type (`FlatList<TItem>` instead of `FlashListRef<TItem>`). FlatList doesn't recycle
 * cells, which makes it a useful control when diagnosing recycling-related swipeable behavior.
 */
const AppFlatListInner = <TItem,>(
  {
    scrollButtonSmall,
    onEndReachedThreshold = 1,
    keyExtractor,
    initialScrollIndex,
    renderListHeader,
    renderListFooter,
    renderItem,
    renderItemSeparator,
    data,
    refreshControl,
    maintainVisibleContentPosition,
    onScrollThreshold,
    enableScrollButton,
    numColumns,
    handleLoadNext,
    extraData,
    style,
    contentContainerStyle,
  }: AppFlatListProps<TItem>,
  ref: React.ForwardedRef<FlatList<TItem>>,
) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  const effectiveScrollButton = enableScrollButton ?? appConfig.userPreferences.showScrollButton;
  const [showScrollButton, setShowScrollButton] = useState(false);

  // FlatList has no `disabled` flag; omit the prop when the caller disabled it.
  const flatListMaintainVisibleContentPosition = useMemo(() => {
    if (!maintainVisibleContentPosition || maintainVisibleContentPosition.disabled) {
      return undefined;
    }
    // FlatList requires minIndexForVisible when the prop is set at all.
    const {minIndexForVisible = 0, autoscrollToTopThreshold} = maintainVisibleContentPosition;
    return {minIndexForVisible, autoscrollToTopThreshold};
  }, [maintainVisibleContentPosition]);

  /** Scroll back to the top when the floating scroll button is pressed. */
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

  return (
    <View style={commonStyles.flex}>
      <FlatList
        ref={ref}
        data={data}
        renderItem={renderItem}
        onScroll={effectiveScrollButton ? onScroll : undefined}
        scrollEventThrottle={effectiveScrollButton || onScrollThreshold ? 16 : undefined}
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
        contentContainerStyle={contentContainerStyle}
        maintainVisibleContentPosition={flatListMaintainVisibleContentPosition}
      />
      {effectiveScrollButton && showScrollButton && (
        <FloatingScrollButton
          testID={'flatListScroll-button'}
          icon={AppIcons.scrollUp}
          onPress={handleScrollButtonPress}
          small={scrollButtonSmall}
        />
      )}
    </View>
  );
};

export const AppFlatList = forwardRef(AppFlatListInner) as <TItem>(
  props: AppFlatListProps<TItem> & {ref?: React.ForwardedRef<FlatList<TItem>>},
) => ReturnType<typeof AppFlatListInner>;
