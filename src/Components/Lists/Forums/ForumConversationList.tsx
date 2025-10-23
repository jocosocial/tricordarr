import React, {useCallback} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {ConversationList, type TConversationListRefObject} from '#src/Components/Lists/ConversationList';
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


interface ForumConversationListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  forumData?: ForumData;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  maintainViewPosition?: boolean;
  enableShowInThread?: boolean;
  listRef: TConversationListRefObject;
  getListHeader?: () => React.JSX.Element;
  forumListData?: ForumListData;
  initialScrollIndex?: number;
}

/**
 * A forum conversation. Not to be confused with a list of posts or a list of threads.
 * Starts at the bottom or where you have not yet read.
 * 
 * @TODO the latter part of that has not been tested with the new LegendList backend.
 */
export const ForumConversationList = ({
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
}: ForumConversationListProps) => {
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();
  const {hasModerator} = usePrivilege();

  const showNewDivider = useCallback(
    (index: number) => {
      if (forumListData && forumData) {
        if (forumListData.postCount === forumListData.readCount) {
          return false;
        }
        // loadedStartIndex is the starting post index from the server of the
        // thread we are viewing. 0 if you've loaded the entire thing.
        // n if you're somewhere in the middle. Regardless it's from the
        // first page of data that you have. That start is the equivalent
        // of item index 0.
        const loadedStartIndex = forumData.paginator.start;
        // + 1 to see it without needing the next page.
        return forumListData.readCount - loadedStartIndex === index;
      }
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
    <ConversationList<PostData>
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
      // Style is here rather than in the renderItem because the padding we use is
      // also needed for the dividers. It could be added to the divider function as
      // well but this is slightly simpler and covers cases I am not remembering.
      style={commonStyles.paddingHorizontalSmall}
    />
  );
};
