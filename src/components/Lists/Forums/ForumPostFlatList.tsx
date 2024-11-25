import {ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, StyleSheet, View} from 'react-native';
import React, {useCallback} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ForumPostListItem} from '../Items/Forum/ForumPostListItem';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {timeAgo} from '../../../libraries/DateTime';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {LabelDivider} from '../Dividers/LabelDivider';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';
import {ConversationFlatList} from '../ConversationFlatList.tsx';
import {FloatingScrollButtonPosition} from '../../../libraries/Types';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

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
  floatingScrollButtonPosition?: FloatingScrollButtonPosition;
  scrollButtonToTop?: boolean;
  scrollButtonIcon?: IconSource;
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
  floatingScrollButtonPosition,
  scrollButtonToTop = false,
  scrollButtonIcon,
}: ForumPostFlatListProps) => {
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const {hasModerator} = usePrivilege();

  const styles = StyleSheet.create({
    postContainerView: {
      ...(invertList ? commonStyles.verticallyInverted : undefined),
    },
    timeDividerStyle: {
      ...(invertList ? commonStyles.verticallyInverted : undefined),
    },
    flatList: {
      ...commonStyles.paddingHorizontal,
      ...(invertList ? commonStyles.verticallyInverted : undefined),
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
    ({leadingItem}: {leadingItem: PostData}) => {
      if (!itemSeparator) {
        return <SpaceDivider />;
      }
      const leadingIndex = postList.indexOf(leadingItem);
      if (leadingIndex === undefined) {
        return <TimeDivider style={styles.timeDividerStyle} label={'Leading Unknown?'} />;
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

      return (
        <TimeDivider
          label={timeAgo.format(invertList ? leadingDate : trailingDate, 'round')}
          style={styles.timeDividerStyle}
        />
      );
    },
    [invertList, itemSeparator, postList, styles.timeDividerStyle],
  );

  const renderListHeader = useCallback(() => {
    if (forumData && !hasPreviousPage) {
      if (getListHeader) {
        return getListHeader();
      }
      return (
        <PaddedContentView padTop={true} invertVertical={invertList}>
          <FlexCenteredContentView>
            <Text variant={'labelMedium'}>You've reached the beginning of this Forum thread.</Text>
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    } else if (hasPreviousPage) {
      return (
        <PaddedContentView padTop={true} invertVertical={invertList}>
          <FlexCenteredContentView>
            <Text variant={'labelMedium'}>Loading previous...</Text>
            {/*<PrimaryActionButton buttonText={'Load Previous'} onPress={handleLoadPrevious} />*/}
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    }
    if (!itemSeparator) {
      return <SpaceDivider />;
    }
    if (postList.length === 0) {
      return <TimeDivider style={styles.timeDividerStyle} label={'No posts to display'} />;
    }
    const firstDisplayItemIndex = invertList ? postList.length - 1 : 0;
    const firstDisplayItem = postList[firstDisplayItemIndex];
    if (!firstDisplayItem.createdAt) {
      return <SpaceDivider />;
    }

    let label = timeAgo.format(new Date(firstDisplayItem.createdAt), 'round');
    return <TimeDivider style={styles.timeDividerStyle} label={label} />;
  }, [forumData, hasPreviousPage, itemSeparator, postList, invertList, styles.timeDividerStyle, getListHeader]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return (
        <PaddedContentView padTop={true} invertVertical={invertList}>
          <FlexCenteredContentView>
            <Text variant={'labelMedium'}>Loading next...</Text>
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    }
    return <SpaceDivider />;
  }, [hasNextPage, invertList]);

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
      scrollButtonPosition={floatingScrollButtonPosition}
      invertList={invertList}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      scrollButtonToTop={scrollButtonToTop}
      scrollButtonIcon={scrollButtonIcon}
    />
  );
};
