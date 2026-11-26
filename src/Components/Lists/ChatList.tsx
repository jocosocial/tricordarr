import {FlashList, type FlashListRef, type ListRenderItem} from '@shopify/flash-list';
import React, {useCallback, useMemo, useState} from 'react';
import {RefreshControlProps, StyleProp, View, ViewStyle} from 'react-native';

import {FloatingScrollButtonsView} from '#src/Components/Buttons/FloatingScrollButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useChatListKeyboardPin} from '#src/Hooks/ChatList/useChatListKeyboardPin';
import {useChatListOwnItemScroll} from '#src/Hooks/ChatList/useChatListOwnItemScroll';
import {useChatListPageFill} from '#src/Hooks/ChatList/useChatListPageFill';
import {useChatListReadyCheck} from '#src/Hooks/ChatList/useChatListReadyCheck';
import {useChatListScrollButtons} from '#src/Hooks/ChatList/useChatListScrollButtons';
import {useChatListScrollHandlers} from '#src/Hooks/ChatList/useChatListScrollHandlers';
import {useChatListSharedState} from '#src/Hooks/ChatList/useChatListSharedState';
import {AUTOSCROLL_TO_BOTTOM_THRESHOLD, START_RENDERING_FROM_BOTTOM} from '#src/Libraries/ChatList/Constants';
import {getFallbackEndIndex, getInitialScrollIndex} from '#src/Libraries/ChatList/InitialScroll';

export type TChatListRef<TItem> = FlashListRef<TItem> | null;
export type TChatListRefObject<TItem> = React.RefObject<TChatListRef<TItem>>;

interface ChatListProps<TItem> {
  listRef: TChatListRefObject<TItem>;
  data: TItem[];
  renderItem: ListRenderItem<TItem>;
  /** Required: FlashList's maintain-visible-content-position is a silent no-op without it. */
  keyExtractor: (item: TItem) => string;
  getItemType?: (item: TItem, index: number, extraData?: unknown) => string | number | undefined;
  /**
   * Forwarded to FlashList. Recycled cells only re-invoke `renderItem` when `item`/`index` change or
   * `extraData` changes identity, so state derived outside `data` (e.g. the "New" divider position)
   * must be reflected here or recycled cells keep stale content.
   */
  extraData?: unknown;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /**
   * Padding goes here rather than on the list's own style, so the scroll indicator stays on the
   * screen edge instead of inside the padding. Horizontal padding only: vertical padding shifts
   * FlashList's first item offset.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Pixels rendered beyond the viewport. Raise for image-heavy lists. */
  drawDistance?: number;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  /**
   * Where the list opens. 'end' opens at the newest item; `{index}` opens with that item (e.g. the
   * first unread) just below the top edge.
   */
  anchor: 'end' | {index: number};
  /**
   * Keep following new items appended at the end while the user is near the bottom. Defaults to
   * `anchor === 'end'`.
   */
  followTail?: boolean;
  /**
   * Identifies items authored by the current user. When an item like that lands at the end of the
   * list the list always scrolls to it, even if the user was not near the bottom.
   */
  isOwnItem?: (item: TItem) => boolean;
  /**
   * Fired once the list is at its initial position. The parent should hide any overlay once this
   * fires. Always fires eventually, including for empty lists.
   */
  onReadyToShow?: () => void;
  /**
   * Index of the "New" divider in `data`. When set, the floating scroll button navigates to the
   * divider instead of the end of the list and points up or down toward it.
   */
  newDividerIndex?: number;
  enableScrollButton?: boolean;
}

/**
 * Chat-style list on FlashList v2 with data ordered oldest to newest. Handles opening at the
 * bottom or at an index, loading older and newer pages without moving the viewport, following new
 * posts, scrolling to the user's own posts, and the floating scroll buttons.
 *
 * Not used directly by screens; domain wrappers (`FezConversationListV2`, `ForumConversationListV2`)
 * supply `renderItem`, dividers, and the anchor. Parent screens hold `readyToShow` state, render an
 * opaque overlay until `onReadyToShow` fires, and remount the list via `key` when the anchor index
 * becomes known (see `FezChatScreen`).
 *
 * Each workaround lives in a concern hook under `src/Hooks/ChatList/`, and its decisions, with the
 * reasons for them, in `src/Libraries/ChatList/`. This component only wires them to FlashList.
 */
export const ChatList = <TItem,>({
  listRef,
  data,
  renderItem,
  keyExtractor,
  getItemType,
  extraData,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  refreshControl,
  contentContainerStyle,
  drawDistance = 500,
  handleLoadNext,
  handleLoadPrevious,
  hasNextPage,
  hasPreviousPage,
  anchor,
  followTail,
  isOwnItem,
  onReadyToShow,
  newDividerIndex,
  enableScrollButton,
}: ChatListProps<TItem>) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  const effectiveScrollButton = enableScrollButton ?? appConfig.userPreferences.showScrollButton;
  const anchorsToEnd = anchor === 'end';
  const anchorIndex = anchor === 'end' ? undefined : anchor.index;
  const effectiveFollowTail = followTail ?? anchorsToEnd;

  // Fallback path only: with START_RENDERING_FROM_BOTTOM off, an end-anchored list opens on its last
  // item. Index 0 is excluded because scrolling to it would hide the list header for no reason.
  const [fallbackEndIndex] = useState(() => getFallbackEndIndex(data.length));
  // Index 0 is also excluded for index anchors: initialScrollIndex scrolls the item to the top edge
  // past the header, and the first item is already visible from offset 0.
  const initialScrollIndex = getInitialScrollIndex(anchor, fallbackEndIndex, START_RENDERING_FROM_BOTTOM);
  // FlashList scrolls to `layout.y + viewOffset`, so a negative offset leaves the item below the top edge.
  const initialScrollIndexParams = useMemo(
    () => (initialScrollIndex !== undefined && !anchorsToEnd ? {viewOffset: -styleDefaults.marginSize} : undefined),
    [initialScrollIndex, anchorsToEnd, styleDefaults.marginSize],
  );

  // The threshold is deliberately not gated on our own near-bottom state: FlashList checks proximity
  // itself, and driving the prop from scroll state would rebuild this object on scroll and race a post
  // that arrives before the state settles. It is undefined while more pages exist because scrollToEnd
  // goes to the end of the loaded window, and following a tail that is not the real tail is wrong.
  const maintainVisibleContentPosition = useMemo(
    () => ({
      startRenderingFromBottom: START_RENDERING_FROM_BOTTOM && anchorsToEnd,
      autoscrollToBottomThreshold: effectiveFollowTail && !hasNextPage ? AUTOSCROLL_TO_BOTTOM_THRESHOLD : undefined,
      animateAutoScrollToBottom: true,
    }),
    [anchorsToEnd, effectiveFollowTail, hasNextPage],
  );

  const shared = useChatListSharedState(listRef);
  const {ready, onLoad} = useChatListReadyCheck({listRef, shared, data, keyExtractor, anchorIndex, onReadyToShow});
  useChatListOwnItemScroll({listRef, data, keyExtractor, isOwnItem});
  const {
    scrollButtonDirection,
    atTop,
    applyScrollButtonDirection,
    applyAtTop,
    onPrimaryPress,
    onSecondaryPress,
    clearButtonTargetIfReached,
    onListTouchStart,
    retryButtonScroll,
  } = useChatListScrollButtons({listRef, shared, newDividerIndex, hasPreviousPage});
  useChatListPageFill({
    listRef,
    shared,
    ready,
    dataLength: data.length,
    anchorsToEnd,
    hasPreviousPage,
    hasNextPage,
    handleLoadPrevious,
    handleLoadNext,
    applyAtTop,
    applyScrollButtonDirection,
  });
  const {onContainerLayout} = useChatListKeyboardPin(listRef, shared);
  const {
    onScroll,
    onContentSizeChange,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
  } = useChatListScrollHandlers({
    shared,
    hasPreviousPage,
    handleLoadPrevious,
    applyAtTop,
    applyScrollButtonDirection,
    clearButtonTargetIfReached,
    retryButtonScroll,
  });

  const lastIndex = data.length - 1;
  /**
   * Renders the caller's item, with the gap below the last post inside the last cell. FlashList
   * leaves ListFooterComponent out of its scroll extent (getMaxScrollOffset), so a footer spacer made
   * scrollToEnd from far away land short and then hop the footer's height once FlashList finished
   * with a native scrollToEnd. Every cell gets the wrapper so the last one doesn't remount when a
   * newer post arrives.
   */
  const renderItemWithEndGap = useCallback<ListRenderItem<TItem>>(
    info => (
      <View style={info.index === lastIndex ? commonStyles.paddingBottomSmall : undefined}>{renderItem(info)}</View>
    ),
    [commonStyles.paddingBottomSmall, lastIndex, renderItem],
  );

  return (
    <View style={commonStyles.flex} onLayout={onContainerLayout}>
      <FlashList<TItem>
        ref={listRef}
        data={data}
        renderItem={renderItemWithEndGap}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        extraData={extraData}
        drawDistance={drawDistance}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        initialScrollIndex={initialScrollIndex}
        initialScrollIndexParams={initialScrollIndexParams}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={refreshControl}
        onStartReached={handleLoadPrevious}
        onEndReached={handleLoadNext}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onTouchStart={onListTouchStart}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onLoad={onLoad}
        contentContainerStyle={contentContainerStyle}
        scrollsToTop={false}
      />
      {effectiveScrollButton && scrollButtonDirection !== null && (
        // The stack renders top to bottom, so up stays above down regardless of
        // which direction is primary.
        <FloatingScrollButtonsView
          actions={
            scrollButtonDirection === 'up'
              ? [
                  {testID: 'conversationListScroll-button', icon: AppIcons.scrollUp, onPress: onPrimaryPress},
                  {
                    testID: 'conversationListSecondaryScroll-button',
                    icon: AppIcons.scrollDown,
                    onPress: onSecondaryPress,
                  },
                ]
              : [
                  {
                    testID: 'conversationListSecondaryScroll-button',
                    icon: AppIcons.scrollUp,
                    onPress: onSecondaryPress,
                    disabled: atTop,
                  },
                  {
                    testID: 'conversationListScroll-button',
                    icon: AppIcons.scrollDown,
                    onPress: onPrimaryPress,
                  },
                ]
          }
        />
      )}
    </View>
  );
};
