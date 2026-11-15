import {FlashList, type FlashListRef, ListRenderItem} from '@shopify/flash-list';
import React, {forwardRef, useCallback, useRef, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, StyleProp, View, ViewStyle} from 'react-native';

import {FloatingScrollButtonsView} from '#src/Components/Buttons/FloatingScrollButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {MaintainVisibleContentPosition} from '#src/Types/Lists';

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
  /** When set (e.g. { disabled: true }), forwarded to FlashList to control scroll correction on reorder. */
  maintainVisibleContentPosition?: MaintainVisibleContentPosition;
  onScrollThreshold?: (condition: boolean) => void;
  listStyle?: StyleProp<ViewStyle>;
  enableScrollButton?: boolean;
  numColumns?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraData?: any;
  style?: ViewStyle;
  scrollButtonSmall?: boolean;
  /** Anchor the scroll buttons above a bottom-right FAB. Set by screens that render one. */
  scrollButtonRaised?: boolean;
  masonry?: boolean;
}

const AppFlashListInner = <TItem,>(
  {
    scrollButtonSmall,
    scrollButtonRaised,
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
    maintainVisibleContentPosition,
    onScrollThreshold,
    enableScrollButton,
    numColumns,
    handleLoadNext,
    extraData,
    style,
    contentContainerStyle,
    masonry = false,
  }: AppFlashListProps<TItem>,
  ref: React.ForwardedRef<FlashListRef<TItem>>,
) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  /**
   * The scroll buttons need a handle on the list even when the caller passes no ref, so the list
   * always holds its own ref and mirrors it to the forwarded one (object or callback).
   */
  const internalRef = useRef<FlashListRef<TItem> | null>(null);
  const setRefs = useCallback(
    (instance: FlashListRef<TItem> | null) => {
      internalRef.current = instance;
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    },
    [ref],
  );
  const effectiveScrollButton = enableScrollButton ?? appConfig.userPreferences.showScrollButton;
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  /**
   * Callback handler for when the scroll button is pressed.
   * Used to track some state for the list contentHeight and would do
   * ref.current?.scrollToOffset({offset: contentHeight, animated: true});
   */
  const handleScrollButtonPress = useCallback(() => {
    internalRef.current?.scrollToOffset({offset: 0, animated: true});
  }, []);

  /** Scroll to the final item in the list. */
  const handleScrollToEnd = useCallback(() => {
    internalRef.current?.scrollToEnd({animated: true});
  }, []);

  /**
   * Show the scroll buttons when a certain scroll threshold has been hit.
   * Allows for a callback to be triggered on that same threshold.
   */
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const distanceFromTop = contentOffset.y;
      const scrollableHeight = Math.max(0, contentSize.height - layoutMeasurement.height);
      /**
       * Lists that cannot scroll past the default threshold would otherwise lose a
       * direction's button while still scrollable, which makes the buttons vanish at
       * the ends of shorter lists. Scale the threshold down instead.
       */
      const scrollThreshold = Math.min(
        styleDefaults.listScrollThreshold,
        Math.max(scrollableHeight / 3, styleDefaults.marginSize),
      );
      const scrollThresholdCondition = distanceFromTop > styleDefaults.listScrollThreshold;
      // Both buttons share the hidden range near the top and stay put near the bottom, as on inverted lists.
      setShowScrollButtons(distanceFromTop > scrollThreshold);
      // Disables the scroll-to-end button once the list is already at its end.
      setAtBottom(scrollableHeight - distanceFromTop <= styleDefaults.marginSize);
      if (onScrollThreshold) {
        onScrollThreshold(scrollThresholdCondition);
      }
    },
    [onScrollThreshold, styleDefaults.listScrollThreshold, styleDefaults.marginSize],
  );

  // https://github.com/facebook/react-native/issues/25239
  return (
    <View style={commonStyles.flex}>
      <FlashList
        ref={setRefs}
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
        contentContainerStyle={contentContainerStyle}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        // columnWrapperStyle is not supported in FlashList v2.
        masonry={masonry}
      />
      {effectiveScrollButton && showScrollButtons && (
        <FloatingScrollButtonsView
          small={scrollButtonSmall}
          raised={scrollButtonRaised}
          actions={[
            {testID: 'flashListScrollUp-button', icon: AppIcons.scrollUp, onPress: handleScrollButtonPress},
            {
              testID: 'flashListScrollDown-button',
              icon: AppIcons.scrollDown,
              onPress: handleScrollToEnd,
              disabled: atBottom,
            },
          ]}
        />
      )}
    </View>
  );
};

export const AppFlashList = forwardRef(AppFlashListInner) as <TItem>(
  props: AppFlashListProps<TItem> & {ref?: React.ForwardedRef<FlashListRef<TItem>>},
) => ReturnType<typeof AppFlashListInner>;
