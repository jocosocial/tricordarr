import React, {useCallback} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {type TConversationListV2RefObject} from '#src/Components/Lists/ConversationListV2';
import {ConversationListV2} from '#src/Components/Lists/ConversationListV2';
import {LabelDivider} from '#src/Components/Lists/Dividers/LabelDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {ForumPostListHeader} from '#src/Components/Lists/Headers/ForumPostListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {ForumPostListItem} from '#src/Components/Lists/Items/Forum/ForumPostListItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
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
  listRef: TConversationListV2RefObject;
  getListHeader?: () => React.JSX.Element;
  forumListData?: ForumListData;
  initialScrollIndex?: number;
  /** Callback fired once the list has reached its initial scroll position. */
  onReadyToShow?: () => void;
}

/**
 * V2 forum conversation list. Wraps ConversationListV2 with forum-specific rendering.
 *
 * Key differences from V1:
 * - Configurable `alignItemsAtEnd` based on whether the thread is fully read.
 * - Exposes `onReadyToShow` to the parent screen for overlay control.
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
}: ForumConversationListV2Props) => {
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();
  const {hasModerator} = usePrivilege();

  // The thread is fully read when readCount equals postCount.
  const isFullyRead = forumListData ? forumListData.readCount === forumListData.postCount : true;

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
      const enablePinnedPosts = hasModerator || forumData?.creator.userID === profilePublicData?.header.userID;
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
    [hasModerator, forumData, profilePublicData?.header.userID, showNewDivider, enableShowInThread],
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
    return <SpaceDivider />;
  }, [hasNextPage]);

  const keyExtractor = useCallback((item: PostData) => item.postID.toString(), []);

  return (
    <ConversationListV2<PostData>
      listRef={listRef}
      data={postList}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
      ItemSeparatorComponent={renderSeparator}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      enableScrollButton={true}
      initialScrollIndex={initialScrollIndex}
      alignItemsAtEnd={isFullyRead}
      estimatedItemSize={120}
      onReadyToShow={onReadyToShow}
      // Style is here rather than in the renderItem because the padding we use is
      // also needed for the dividers. It could be added to the divider function as
      // well but this is slightly simpler and covers cases I am not remembering.
      style={commonStyles.paddingHorizontalSmall}
    />
  );
};
