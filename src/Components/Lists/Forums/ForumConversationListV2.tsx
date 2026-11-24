import React, {useCallback, useMemo} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {ChatList, type TChatListRefObject} from '#src/Components/Lists/ChatList';
import {LabelDivider} from '#src/Components/Lists/Dividers/LabelDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {ForumPostListHeader} from '#src/Components/Lists/Headers/ForumPostListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {ForumPostListItem} from '#src/Components/Lists/Items/Forum/ForumPostListItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ForumData, ForumListData, PostData} from '#src/Structs/ControllerStructs';

interface ForumConversationListV2Props {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  forumData?: ForumData;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  enableShowInThread?: boolean;
  listRef: TChatListRefObject<PostData>;
  getListHeader?: () => React.JSX.Element;
  forumListData?: ForumListData;
  initialScrollIndex?: number;
  /** Callback fired once the list has reached its initial scroll position. */
  onReadyToShow?: () => void;
  /**
   * True when opened from a specific post. The selected post is first in the
   * loaded page, so do not align the list to the end as if the thread were fully read.
   */
  startFromPost?: boolean;
}

/**
 * Forum conversation list. Wraps ChatList with forum-specific rendering (post items, the "New"
 * divider). Anchors to the end when the thread is fully read, else to `initialScrollIndex`.
 */
export const ForumConversationListV2 = ({
  postList,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
  forumData,
  hasPreviousPage,
  enableShowInThread,
  listRef,
  getListHeader,
  forumListData,
  hasNextPage,
  initialScrollIndex,
  onReadyToShow,
  startFromPost,
}: ForumConversationListV2Props) => {
  const {commonStyles} = useStyles();
  const {currentUserID} = useSession();
  const {hasModerator} = usePrivilege();

  // The thread is fully read when readCount equals postCount. A thread opened
  // from a specific post has no forumListData, which would otherwise look fully
  // read and pin the list to the last item — hiding the startPost.
  const isFullyRead = startFromPost
    ? false
    : forumListData
      ? forumListData.readCount === forumListData.postCount
      : true;

  // Compute the divider index for the scroll button. Only set when the divider
  // is within the loaded data range.
  const newDividerIndex = useMemo(() => {
    if (!forumListData || !forumData) return undefined;
    if (forumListData.postCount === forumListData.readCount) return undefined;
    const idx = forumListData.readCount - forumData.paginator.start;
    return idx >= 0 && idx < postList.length ? idx : undefined;
  }, [forumData, forumListData, postList.length]);

  const showNewDivider = useCallback(
    (index: number) => {
      if (forumListData && forumData) {
        if (forumListData.postCount === forumListData.readCount) {
          return false;
        }
        const loadedStartIndex = forumData.paginator.start;
        return forumListData.readCount - loadedStartIndex === index;
      }
      return false;
    },
    [forumData, forumListData],
  );

  const renderItem = useCallback(
    ({item, index}: {item: PostData; index: number}) => {
      const enablePinnedPosts = hasModerator || forumData?.creator.userID === currentUserID;
      return (
        <View>
          {showNewDivider(index) && <LabelDivider label={'New'} />}
          <ForumPostListItem
            postData={item}
            enableShowInThread={enableShowInThread}
            enablePinnedPosts={enablePinnedPosts}
            forumData={forumData}
          />
        </View>
      );
    },
    [hasModerator, forumData, currentUserID, showNewDivider, enableShowInThread],
  );

  const renderSeparator = useCallback(() => <SpaceDivider />, []);

  const renderListHeader = useCallback(() => {
    if (forumData && !hasPreviousPage) {
      if (getListHeader) {
        return getListHeader();
      }
      return <ForumPostListHeader />;
    } else if (hasPreviousPage) {
      return <LoadingPreviousHeader />;
    }
    return <SpaceDivider />;
  }, [forumData, hasPreviousPage, getListHeader]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    // No spacer here: ChatList puts the gap below the last post inside the last cell.
    return null;
  }, [hasNextPage]);

  const keyExtractor = useCallback((item: PostData) => item.postID.toString(), []);

  /** Recycled cells are only reused for items that render the same chrome (the New divider). */
  const getItemType = useCallback(
    (item: PostData, index: number) => (showNewDivider(index) ? 'post-with-divider' : 'post'),
    [showNewDivider],
  );

  const isOwnItem = useCallback((item: PostData) => item.author.userID === currentUserID, [currentUserID]);

  // Opened from a specific post: that post is first in the loaded page. Otherwise a fully-read
  // thread opens at the end and an unread one at the first unread post.
  const anchor = startFromPost ? {index: 0} : isFullyRead ? ('end' as const) : {index: initialScrollIndex ?? 0};

  return (
    <ChatList<PostData>
      listRef={listRef}
      data={postList}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
      ItemSeparatorComponent={renderSeparator}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      anchor={anchor}
      isOwnItem={isOwnItem}
      // Image-heavy threads: render further beyond the viewport so tall late-loading items are
      // already laid out when scrolled to (Shopify/flash-list#1951).
      drawDistance={1000}
      onReadyToShow={onReadyToShow}
      newDividerIndex={newDividerIndex}
      // renderItem's "New" divider placement is driven by isFullyRead/newDividerIndex,
      // which live outside `data`. FlashList's recycled cells only
      // redraw when `item`/`index` change or `extraData` changes identity, so without this
      // a cell that already rendered a divider would keep showing it after posting (see
      // the same fix in FezConversationListV2). Combine both so every visibility/position
      // transition is distinguishable, including two different "hidden" states that would
      // otherwise both be `undefined`.
      extraData={`${isFullyRead}-${newDividerIndex}`}
      // Style is here rather than in the renderItem because the padding we use is
      // also needed for the dividers. It could be added to the divider function as
      // well but this is slightly simpler and covers cases I am not remembering.
      // On the content container, not the list, so the scroll bar stays on the screen edge.
      contentContainerStyle={commonStyles.paddingHorizontalSmall}
    />
  );
};
