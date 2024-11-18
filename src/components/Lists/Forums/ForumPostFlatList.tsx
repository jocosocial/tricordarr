import {ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
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
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {styleDefaults} from '../../../styles';
import {FlexCenteredContentView} from '../../Views/Content/FlexCenteredContentView.tsx';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';

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
  initialScrollIndex,
}: ForumPostFlatListProps) => {
  const {commonStyles} = useStyles();
  const [showButton, setShowButton] = useState(false);
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowButton(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
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
        // @TODO there is a logic bug here.
        // console.log('postCount', forumListData.postCount);
        // console.log('readCount', forumListData.readCount);
        // console.log('index', index);
        // index === forumListData.readCount is ignorant of what pages have been loaded.
        // Do we need to guarantee that all previous pages have been fetched?
        return index === forumListData.readCount;
        // return forumListData.postCount - index === forumListData.readCount + 1;
      }
    },
    [forumListData],
  );

  const onItemLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const {height} = event.nativeEvent.layout;
      setItemHeights(prevHeights => {
        if (prevHeights[index] !== height) {
          const newHeights = {...prevHeights, [index]: height};

          // Update cumulative offsets for all items
          cumulativeOffsets.current = [];
          let runningOffset = 0;
          for (let i = 0; i < postList.length; i++) {
            const itemHeight = newHeights[i] || 50; // Default height for unmeasured items
            cumulativeOffsets.current[i] = runningOffset;
            runningOffset += itemHeight;
          }

          return newHeights;
        }
        return prevHeights;
      });
    },
    [postList.length],
  );

  const renderItem = useCallback(
    ({item, index}: {item: PostData; index: number}) => {
      const enablePinnedPosts = hasModerator || forumData?.creator.userID === profilePublicData?.header.userID;
      return (
        <View style={styles.postContainerView} onLayout={onItemLayout(index)}>
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
    [
      hasModerator,
      forumData,
      profilePublicData?.header.userID,
      styles.postContainerView,
      onItemLayout,
      showNewDivider,
      enableShowInThread,
    ],
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
            {/*<Text variant={'labelMedium'}>Loading more...</Text>*/}
            <PrimaryActionButton buttonText={'Load Previous'} onPress={handleLoadPrevious} />
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
  }, [
    forumData,
    hasPreviousPage,
    itemSeparator,
    postList,
    invertList,
    styles.timeDividerStyle,
    getListHeader,
    handleLoadPrevious,
  ]);

  const renderListFooter = useCallback(() => {
    if (hasNextPage) {
      return (
        <PaddedContentView padTop={true} invertVertical={invertList}>
          <FlexCenteredContentView>
            {hasNextPage ? (
              // <Text variant={'labelMedium'}>Loading more...</Text>
              <PrimaryActionButton buttonText={'Load Next'} onPress={handleLoadNext} />
            ) : (
              <Text variant={'labelMedium'}>End of thread</Text>
            )}
          </FlexCenteredContentView>
        </PaddedContentView>
      );
    }
    return <SpaceDivider />;
  }, [handleLoadNext, hasNextPage, invertList]);

  const [itemHeights, setItemHeights] = useState<Record<number, number>>({});
  const cumulativeOffsets = useRef<number[]>([]);

  const getItemLayout = (_data: PostData[], index: number) => {
    const offset = cumulativeOffsets.current[index] ?? 0;
    const length = itemHeights[index] ?? 50; // Default height for unmeasured items
    return {length, offset, index};
  };

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
        // onStartReached={invertList ? handleLoadNext : handleLoadPrevious}
        // onEndReached={invertList ? handleLoadPrevious : handleLoadNext}
        // onEndReachedThreshold={10}
        keyExtractor={(item: PostData) => String(item.postID)}
        ItemSeparatorComponent={renderSeparator}
        // ERROR  Invariant Violation: scrollToIndex should be used in conjunction with
        // getItemLayout or onScrollToIndexFailed, otherwise there is no way to know the
        // location of offscreen indices or handle failures., js engine: hermes
        // This applies to initialScrollIndex as well!

        // initialScrollIndex={initialScrollIndex}
        // onScrollToIndexFailed={() => console.warn('scroll failed')}
        // initialScrollIndex={0}
        // onScrollToIndexFailed={info => {
        //   // Log the failure
        //   console.warn('Scroll to index failed:', info);
        //
        //   // Scroll to a closer valid index
        //   flatListRef.current?.scrollToIndex({
        //     index: Math.min(info.highestMeasuredFrameIndex, info.index),
        //     animated: true,
        //   });
        // }}
        // getItemLayout={getItemLayout}
      />
      {showButton && !hasNextPage && (
        <FloatingScrollButton
          icon={invertList ? AppIcons.scrollDown : AppIcons.scrollUp}
          onPress={handleScrollButtonPress}
          displayPosition={forumData ? (forumData.isLocked ? 'bottom' : 'raised') : 'bottom'}
        />
      )}
    </>
  );
};
