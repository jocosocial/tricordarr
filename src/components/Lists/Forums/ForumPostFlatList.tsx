import {ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, StyleSheet, View} from 'react-native';
import React, {useCallback} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ForumPostListItem} from '../Items/Forum/ForumPostListItem';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {timeAgo} from '../../../libraries/DateTime';
import {LabelDivider} from '../Dividers/LabelDivider';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ConversationFlatList} from '../ConversationFlatList.tsx';
import {FlatListSeparatorProps, FloatingScrollButtonPosition} from '../../../libraries/Types';
import {ForumPostListHeader} from '../Headers/ForumPostListHeader.tsx';
import {LoadingPreviousHeader} from '../Headers/LoadingPreviousHeader.tsx';
import {LoadingNextFooter} from '../Footers/LoadingNextFooter.tsx';

interface ForumPostFlatListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  itemSeparator?: 'time';
  invertList?: boolean;
  forumData?: ForumData;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  maintainViewPosition?: boolean;
  enableShowInThread?: boolean;
  flatListRef: React.RefObject<FlatList<PostData>>;
  getListHeader?: () => React.JSX.Element;
  forumListData?: ForumListData;
  initialScrollIndex?: number;
  scrollButtonPosition?: FloatingScrollButtonPosition;
}

export const ForumPostFlatList = ({
  postList,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
  itemSeparator,
  invertList,
  forumData,
  hasPreviousPage,
  maintainViewPosition,
  enableShowInThread,
  flatListRef,
  getListHeader,
  forumListData,
  hasNextPage,
  initialScrollIndex = 0,
  scrollButtonPosition,
}: ForumPostFlatListProps) => {
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const {hasModerator} = usePrivilege();

  const styles = StyleSheet.create({
    flatList: {
      ...commonStyles.paddingHorizontal,
    },
  });

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

  const renderSeparator = useCallback(
    ({leadingItem}: FlatListSeparatorProps<PostData>) => {
      if (!itemSeparator) {
        return <SpaceDivider />;
      }
      const leadingIndex = postList.indexOf(leadingItem);
      if (leadingIndex === undefined) {
        return <TimeDivider label={'Leading Unknown?'} />;
      }
      const trailingIndex = leadingIndex + 1;
      const trailingItem = postList[trailingIndex];
      if (!leadingItem.createdAt || !trailingItem.createdAt) {
        return <SpaceDivider />;
      }
      const leadingDate = new Date(leadingItem.createdAt);
      const trailingDate = new Date(trailingItem.createdAt);
      const leadingTimeMarker = timeAgo.format(leadingDate, 'round');
      const trailingTimeMarker = timeAgo.format(trailingDate, 'round');
      if (leadingTimeMarker === trailingTimeMarker) {
        return <SpaceDivider />;
      }

      return <TimeDivider label={timeAgo.format(invertList ? leadingDate : trailingDate, 'round')} />;
    },
    [invertList, itemSeparator, postList],
  );

  const renderListHeader = useCallback(() => {
    if (forumData && !hasPreviousPage) {
      if (getListHeader) {
        return getListHeader();
      }
      return <ForumPostListHeader />;
    } else if (hasPreviousPage) {
      return <LoadingPreviousHeader />;
    }
    if (!itemSeparator) {
      return <SpaceDivider />;
    }
    if (postList.length === 0) {
      return <TimeDivider label={'No posts to display'} />;
    }
    const firstDisplayItemIndex = invertList ? postList.length - 1 : 0;
    const firstDisplayItem = postList[firstDisplayItemIndex];
    if (!firstDisplayItem.createdAt) {
      return <SpaceDivider />;
    }

    let label = timeAgo.format(new Date(firstDisplayItem.createdAt), 'round');
    return <TimeDivider label={label} />;
  }, [forumData, hasPreviousPage, itemSeparator, postList, invertList, getListHeader]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    return <SpaceDivider />;
  }, [hasNextPage]);

  return (
    <ConversationFlatList
      flatListRef={flatListRef}
      handleLoadPrevious={handleLoadPrevious}
      handleLoadNext={handleLoadNext}
      renderListHeader={renderListHeader}
      renderListFooter={renderListFooter}
      renderItem={renderItem}
      data={postList}
      renderItemSeparator={renderSeparator}
      maintainViewPosition={maintainViewPosition}
      initialScrollIndex={initialScrollIndex}
      refreshControl={refreshControl}
      scrollButtonPosition={scrollButtonPosition}
      invertList={invertList}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      listStyle={styles.flatList}
    />
  );
};
