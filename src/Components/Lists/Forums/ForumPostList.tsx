import {FlashListRef} from '@shopify/flash-list';
import React, {useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {TimeDivider} from '#src/Components/Lists/Dividers/TimeDivider';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {ForumPostListHeader} from '#src/Components/Lists/Headers/ForumPostListHeader';
import {LoadingPreviousHeader} from '#src/Components/Lists/Headers/LoadingPreviousHeader';
import {ForumPostListItem} from '#src/Components/Lists/Items/Forum/ForumPostListItem';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {timeAgo} from '#src/Libraries/DateTime';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  itemSeparator?: 'time';
  forumData?: ForumData;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  maintainViewPosition?: boolean;
  enableShowInThread?: boolean;
  listRef: React.RefObject<FlashListRef<PostData> | null>;
  getListHeader?: () => React.JSX.Element;
  initialScrollIndex?: number;
  // I don't think handleLoadPrevious was ever used for ForumPostLists
  // because PostLists always start from the beginning.
  // handleLoadPrevious?: () => void;
}

export const ForumPostList = ({
  postList,
  refreshControl,
  handleLoadNext,
  itemSeparator = 'time',
  forumData,
  hasPreviousPage,
  enableShowInThread,
  listRef,
  getListHeader,
  hasNextPage,
  initialScrollIndex,
}: ForumPostListProps) => {
  const {commonStyles} = useStyles();

  const renderItem = useCallback(
    ({item}: {item: PostData}) => {
      return (
        <ForumPostListItem
          postData={item}
          enableShowInThread={enableShowInThread}
          enablePinnedPosts={false}
          forumData={forumData}
        />
      );
    },
    [enableShowInThread, forumData],
  );

  // const renderSeparator = useCallback(
  //   ({leadingItem}: {leadingItem: PostData}) => {
  //     if (!itemSeparator) {
  //       return <SpaceDivider />;
  //     }
  //     const leadingIndex = postList.indexOf(leadingItem);
  //     if (leadingIndex === undefined) {
  //       return <TimeDivider label={'Leading Unknown?'} />;
  //     }
  //     const trailingIndex = leadingIndex + 1;
  //     const trailingItem = postList[trailingIndex];
  //     if (!leadingItem.createdAt || !trailingItem.createdAt) {
  //       return <SpaceDivider />;
  //     }
  //     const leadingDate = new Date(leadingItem.createdAt);
  //     const trailingDate = new Date(trailingItem.createdAt);
  //     const leadingTimeMarker = timeAgo.format(leadingDate, 'round');
  //     const trailingTimeMarker = timeAgo.format(trailingDate, 'round');
  //     if (leadingTimeMarker === trailingTimeMarker) {
  //       return <SpaceDivider />;
  //     }

  //     return <TimeDivider label={timeAgo.format(trailingDate, 'round')} />;
  //   },
  //   [itemSeparator, postList],
  // );

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
    if (!itemSeparator) {
      return <SpaceDivider />;
    }
    if (postList.length === 0) {
      return <TimeDivider label={'No posts to display'} />;
    }
    const firstDisplayItemIndex = 0;
    const firstDisplayItem = postList[firstDisplayItemIndex];
    if (!firstDisplayItem.createdAt) {
      return <SpaceDivider />;
    }

    let label = timeAgo.format(new Date(firstDisplayItem.createdAt), 'round');
    return <TimeDivider label={label} />;
  }, [forumData, hasPreviousPage, itemSeparator, postList, getListHeader]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    return <SpaceDivider />;
  }, [hasNextPage]);

  const keyExtractor = useCallback((item: PostData) => item.postID.toString(), []);

  return (
    <AppFlashList<PostData>
      ref={listRef}
      data={postList}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      renderListHeader={renderListHeader}
      renderListFooter={renderListFooter}
      renderItemSeparator={renderSeparator}
      refreshControl={refreshControl}
      handleLoadNext={handleLoadNext}
      // handleLoadNext={handleLoadNext}
      // handleLoadPrevious={handleLoadPrevious}
      // loadPrevious={handleLoadPrevious}
      enableScrollButton={true}
      initialScrollIndex={initialScrollIndex}
      // Style is here rather than in the renderItem because the padding we use is
      // also needed for the dividers. It could be added to the divider function as
      // well but this is slightly simpler and covers cases I am not remembering.
      style={commonStyles.paddingHorizontalSmall}
    />
  );
};
