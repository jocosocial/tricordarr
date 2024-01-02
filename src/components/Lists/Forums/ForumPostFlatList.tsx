import {ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, StyleSheet, View} from 'react-native';
import React, {ReactNode, useCallback, useState} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {ForumPostListItem} from '../Items/Forum/ForumPostListItem';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {timeAgo} from '../../../libraries/DateTime';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {LabelDivider} from '../Dividers/LabelDivider';

interface ForumPostFlatListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext: () => void;
  handleLoadPrevious?: () => void;
  itemSeparator?: 'time';
  invertList?: boolean;
  forumData?: ForumData;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  maintainViewPosition?: boolean;
  enableShowInThread?: boolean;
  flatListRef: React.RefObject<FlatList<PostData>>;
  getListHeader?: () => ReactNode;
  forumListData?: ForumListData;
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
}: ForumPostFlatListProps) => {
  const {commonStyles} = useStyles();
  const [showButton, setShowButton] = useState(false);

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

  const handleScroll = (event: any) => {
    // I picked 450 out of a hat. Roughly 8 messages @ 56 units per message.
    // console.log(event.nativeEvent.contentOffset.y);
    setShowButton(event.nativeEvent.contentOffset.y > 450);
  };

  const handleScrollButtonPress = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  const showNewDivider = useCallback(
    (index: number) => {
      if (forumListData) {
        if (forumListData.postCount === forumListData.readCount) {
          return false;
        }
        // index is inverted so the last message in the list is 0.
        // Add one to the readCount so that we render below the message at the readCount.
        // This doesn't do anything with un-inverted lists.
        return forumListData.postCount - index === forumListData.readCount + 1;
      }
    },
    [forumListData],
  );

  const renderItem = useCallback(
    ({item, index}: {item: PostData; index: number}) => (
      <View style={styles.postContainerView}>
        {showNewDivider(index) && <LabelDivider label={'New'} />}
        <ForumPostListItem postData={item} enableShowInThread={enableShowInThread} />
      </View>
    ),
    [styles.postContainerView, showNewDivider, enableShowInThread],
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
      return (
        <PaddedContentView padTop={true} invertVertical={invertList}>
          {getListHeader ? (
            getListHeader()
          ) : (
            <View style={[commonStyles.flexRow]}>
              <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
                <Text variant={'labelMedium'}>You've reached the beginning of this Forum thread.</Text>
              </View>
            </View>
          )}
        </PaddedContentView>
      );
    } else if (hasPreviousPage) {
      return (
        <PaddedContentView padTop={true} invertVertical={invertList}>
          <View style={[commonStyles.flexRow]}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
              <Text variant={'labelMedium'}>Loading more...</Text>
            </View>
          </View>
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
  }, [
    commonStyles.alignItemsCenter,
    commonStyles.flex,
    commonStyles.flexRow,
    forumData,
    hasPreviousPage,
    getListHeader,
    invertList,
    itemSeparator,
    postList,
    styles.timeDividerStyle,
  ]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return (
        <PaddedContentView padTop={true} invertVertical={invertList}>
          <View style={[commonStyles.flexRow]}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
              <Text variant={'labelMedium'}>Loading more...</Text>
            </View>
          </View>
        </PaddedContentView>
      );
    }
    return <SpaceDivider />;
  }, [commonStyles.alignItemsCenter, commonStyles.flex, commonStyles.flexRow, hasNextPage, invertList]);

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlatList
        style={styles.flatList}
        ref={flatListRef}
        refreshControl={refreshControl}
        data={postList}
        renderItem={renderItem}
        ListFooterComponent={invertList ? renderListHeader : renderListFooter}
        ListHeaderComponent={invertList ? renderListFooter : renderListHeader}
        onScroll={handleScroll}
        maintainVisibleContentPosition={maintainViewPosition ? {minIndexForVisible: 0} : undefined}
        onStartReached={invertList ? handleLoadNext : handleLoadPrevious}
        onEndReached={invertList ? handleLoadPrevious : handleLoadNext}
        onEndReachedThreshold={10}
        keyExtractor={(item: PostData) => String(item.postID)}
        ItemSeparatorComponent={renderSeparator}
      />
      {showButton && !hasNextPage && (
        <FloatingScrollButton
          icon={invertList ? AppIcons.scrollDown : AppIcons.scrollUp}
          onPress={handleScrollButtonPress}
          displayPosition={forumListData?.isLocked ? 'bottom' : 'raised'}
        />
      )}
    </>
  );
};
