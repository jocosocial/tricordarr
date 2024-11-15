import {ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs.tsx';
import React, {useCallback, useState} from 'react';
import {FlatList, RefreshControlProps, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useUserData} from '../../Context/Contexts/UserDataContext.ts';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {FlashList} from '@shopify/flash-list';
import {LabelDivider} from '../Dividers/LabelDivider.tsx';
import {ForumPostListItem} from '../Items/Forum/ForumPostListItem.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {SpaceDivider} from '../Dividers/SpaceDivider.tsx';
import {TimeDivider} from '../Dividers/TimeDivider.tsx';
import {timeAgo} from '../../../libraries/DateTime.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';

interface ForumPostFlashListProps {
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
}

// @TODO the API returns the first page of posts that you have not read.
// This means you should start at the beginning and scroll down.
// I think what I'm missing is that I never solved for starting at the beginning or end
// based on whether it was considered "unread" or not.
export const ForumPostFlashList = (props: ForumPostFlashListProps) => {
  const {commonStyles} = useStyles();
  const [showButton, setShowButton] = useState(false);
  const {profilePublicData} = useUserData();
  const {hasModerator} = usePrivilege();

  const styles = StyleSheet.create({
    postContainerView: {
      // ...(props.invertList ? commonStyles.verticallyInverted : undefined),
    },
    timeDividerStyle: {
      // ...(props.invertList ? commonStyles.verticallyInverted : undefined),
    },
    flatList: {
      ...commonStyles.paddingHorizontal,
      // ...(props.invertList ? commonStyles.verticallyInverted : undefined),
    },
  });

  const showNewDivider = useCallback(
    (index: number) => {
      if (props.forumListData) {
        if (props.forumListData.postCount === props.forumListData.readCount) {
          return false;
        }
        // index is inverted so the last message in the list is 0.
        // Add one to the readCount so that we render below the message at the readCount.
        // This doesn't do anything with un-inverted lists.
        return props.forumListData.postCount - index === props.forumListData.readCount + 1;
      }
    },
    [props.forumListData],
  );

  const renderItem = useCallback(
    ({item, index}: {item: PostData; index: number}) => {
      const enablePinnedPosts = hasModerator || props.forumData?.creator.userID === profilePublicData?.header.userID;
      return (
        <View style={styles.postContainerView}>
          {showNewDivider(index) && <LabelDivider label={'New'} />}
          <ForumPostListItem
            postData={item}
            enableShowInThread={props.enableShowInThread}
            enablePinnedPosts={enablePinnedPosts}
            forumData={props.forumData}
          />
        </View>
      );
    },
    [
      hasModerator,
      profilePublicData?.header.userID,
      styles.postContainerView,
      showNewDivider,
      props.enableShowInThread,
      props.forumData,
    ],
  );

  const renderListHeader = useCallback(() => {
    if (props.forumData && !props.hasPreviousPage) {
      if (props.getListHeader) {
        return props.getListHeader();
      }
      return (
        <PaddedContentView padTop={true}>
          <FlexCenteredContentView>
            <Text variant={'labelMedium'}>You've reached the beginning of this Forum thread.</Text>
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    } else if (props.hasPreviousPage) {
      return (
        <PaddedContentView padTop={true}>
          <FlexCenteredContentView>
            {/*<Text variant={'labelMedium'}>Loading more...</Text>*/}
            <PrimaryActionButton buttonText={'Load Previous'} onPress={props.handleLoadPrevious} />
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    }
    if (!props.itemSeparator) {
      return <SpaceDivider />;
    }
    if (props.postList.length === 0) {
      return <TimeDivider style={styles.timeDividerStyle} label={'No posts to display'} />;
    }
    const firstDisplayItemIndex = props.invertList ? props.postList.length - 1 : 0;
    const firstDisplayItem = props.postList[firstDisplayItemIndex];
    if (!firstDisplayItem.createdAt) {
      return <SpaceDivider />;
    }

    let label = timeAgo.format(new Date(firstDisplayItem.createdAt), 'round');
    return <TimeDivider style={styles.timeDividerStyle} label={label} />;
  }, [props, styles.timeDividerStyle]);

  const renderListFooter = useCallback(() => {
    return (
      <PaddedContentView padTop={true}>
        <FlexCenteredContentView>
          {props.hasNextPage ? (
            // <Text variant={'labelMedium'}>Loading more...</Text>
            <PrimaryActionButton buttonText={'Load Next'} onPress={props.handleLoadNext} />
          ) : (
            <Text variant={'labelMedium'}>End of thread</Text>
          )}
        </FlexCenteredContentView>
      </PaddedContentView>
    );
    // return <SpaceDivider />;
  }, [props.handleLoadNext, props.hasNextPage]);

  const renderSeparator = useCallback(
    ({leadingItem}: {leadingItem: PostData}) => {
      if (!props.itemSeparator) {
        return <SpaceDivider />;
      }
      const leadingIndex = props.postList.indexOf(leadingItem);
      if (leadingIndex === undefined) {
        return <TimeDivider style={styles.timeDividerStyle} label={'Leading Unknown?'} />;
      }
      const trailingIndex = leadingIndex + 1;
      const trailingItem = props.postList[trailingIndex];
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
          label={timeAgo.format(props.invertList ? leadingDate : trailingDate, 'round')}
          style={styles.timeDividerStyle}
        />
      );
    },
    [props.invertList, props.itemSeparator, props.postList, styles.timeDividerStyle],
  );

  console.log('[ForumPostFlashList.tsx] initial scroll index is', props.initialScrollIndex);

  return (
    <>
      <FlashList
        renderItem={renderItem}
        data={props.postList}
        // https://github.com/Shopify/flash-list/issues/751
        overrideProps={{isInvertedVirtualizedList: props.invertList}}
        inverted={props.invertList}
        contentContainerStyle={styles.flatList}
        ListFooterComponent={props.invertList ? renderListHeader : renderListFooter}
        ListHeaderComponent={props.invertList ? renderListFooter : renderListHeader}
        initialScrollIndex={props.initialScrollIndex}
        ItemSeparatorComponent={renderSeparator}
      />
    </>
  );
};
