import {ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {
  FlatList,
  LayoutRectangle,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import React, {useCallback, useState} from 'react';
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
import {LoadingView} from '../../Views/Static/LoadingView.tsx';

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

// interface InternalItemProps {
//   viewStyle: StyleProp<ViewStyle>;
//   onLayout;
// }
//
// const InternalItem = () => {
//   return (
//     <View
//       style={styles.postContainerView}
//       onLayout={event => {
//         // Doing this without the variable blows up with a null value. Wonder
//         // if the setter callback is resetting the event context? /shrug.
//         const layout = event.nativeEvent.layout;
//         console.log(`index=${index}`, 'layout', layout, `post=${item.text.substring(0, 9)}`);
//         setItemHeights(prevData => {
//           return [...prevData, layout.height];
//         });
//       }}>
//       {showNewDivider(index) && <LabelDivider label={'New'} />}
//       <ForumPostListItem
//         postData={item}
//         enableShowInThread={enableShowInThread}
//         enablePinnedPosts={enablePinnedPosts}
//         forumData={forumData}
//       />
//     </View>
//   );
// };

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
}: ForumPostFlatListProps) => {
  const {commonStyles} = useStyles();
  const [showButton, setShowButton] = useState(false);
  const {profilePublicData} = useUserData();
  const {hasModerator} = usePrivilege();
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  // const [hasScrolled, setHasScrolled] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

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

  // const isAtBottom = useSharedValue(true);
  // const isAtTop = useSharedValue(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // isAtBottom.modify(value => value);
    // console.log(event.nativeEvent);
    if (invertList) {
      setShowButton(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
    } else {
      setShowButton(
        event.nativeEvent.contentSize.height - event.nativeEvent.contentOffset.y >
          styleDefaults.listScrollThreshold * 2,
      );
    }
  };

  const handleScrollButtonPress = () => {
    if (invertList) {
      console.log('[ForumPostFlatList.tsx] scrolling to offset 0');
      flatListRef.current?.scrollToOffset({offset: 0, animated: true});
      // setShowButton(false);
    } else {
      console.log('[ForumPostFlatList.tsx] scrolling to end');
      // flatListRef.current?.scrollToEnd({animated: true});
      flatListRef.current?.scrollToOffset({offset: contentHeight, animated: true});
      // setTimeout(() => setShowButton(false), 100);
      // flatListRef.current?.scrollToIndex({
      //   index: postList.length - 1,
      //   animated: true,
      // });
    }
  };

  const getItemHeight = (index: number) => {
    // if (itemHeights[index] !== undefined) {
    //   return itemHeights[index];
    // }
    // return 0;
    return itemHeights[index] || 0;
  };

  // @TODO factor in separators.
  const getItemOffset = (index: number) => {
    if (itemHeights[index] === undefined) {
      return 0;
    }
    return itemHeights.slice(0, index).reduce((previousValue, currentItem) => previousValue + currentItem, 0);
  };

  const getItemLayout = (data: ArrayLike<PostData> | null | undefined, index: number) => ({
    length: getItemHeight(index),
    offset: getItemOffset(index),
    index,
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
        <View
          style={styles.postContainerView}
          onLayout={event => {
            // Doing this without the variable blows up with a null value. Wonder
            // if the setter callback is resetting the event context? /shrug.
            const layout = event.nativeEvent.layout;
            console.log(`index=${index}`, 'layout', layout, `post=${item.text.substring(0, 9)}`);
            setItemHeights(prevData => {
              return [...prevData, layout.height];
            });
          }}>
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

  const onContentSizeChange = (w: number, h: number) => {
    setContentHeight(h);
  };
  //
  // console.log('[ForumPostFlatList.tsx] initial scroll index:', initialScrollIndex);
  // console.log('[ForumPostFlatList.tsx] item length:', postList.length);
  // console.log('[ForumPostFlatList.tsx] layout heights length:', itemHeights.length);
  // console.log(showButton);

  /**
   * If the forum has been fully read and you only have the latest very small
   * page, it can leave the list in a situation where the onEndReached hook
   * never fires. This is particularly problematic in inverted lists because
   * you can be left with one or two posts and a header that says Loading.
   * So this jogs its memory. A potential future optimization can be to trigger
   * this only if the pageSize is small (like <=10).
   */
  const onListLayout = () => {
    if (invertList && hasPreviousPage && handleLoadPrevious) {
      handleLoadPrevious();
    }
  };

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlatList
        onLayout={invertList ? onListLayout : undefined}
        style={styles.flatList}
        ref={flatListRef}
        refreshControl={refreshControl}
        data={postList}
        renderItem={renderItem}
        ListFooterComponent={invertList ? renderListHeader : renderListFooter}
        ListHeaderComponent={invertList ? renderListFooter : renderListHeader}
        onScroll={handleScroll}
        maintainVisibleContentPosition={maintainViewPosition ? {minIndexForVisible: 0} : undefined}
        onContentSizeChange={onContentSizeChange}
        onStartReached={invertList ? handleLoadNext : handleLoadPrevious}
        onEndReached={invertList ? handleLoadPrevious : handleLoadNext}
        onEndReachedThreshold={1} // 10
        onStartReachedThreshold={1}
        keyExtractor={(item: PostData) => String(item.postID)}
        ItemSeparatorComponent={renderSeparator}
        // ERROR  Invariant Violation: scrollToIndex should be used in conjunction with
        // getItemLayout or onScrollToIndexFailed, otherwise there is no way to know the
        // location of offscreen indices or handle failures., js engine: hermes
        // This applies to initialScrollIndex as well!
        getItemLayout={getItemLayout}
        // Just setting initialScrollIndex is causing the list to be empty. Allegedly this is
        // because FlatList skips rendering for invisible items.
        // disableVirtualization={true} made this work, though I feel like I'm going to
        // regret it at some point.
        initialScrollIndex={initialScrollIndex}
        disableVirtualization={true}
        onScrollToIndexFailed={info => console.warn('scroll failed', info)}
        // Setting scrollEventThrottle to [at least] 100 makes the scroll button disappearance less reliable.
        // scrollEventThrottle={100}
        // initialNumToRender={20}
        // @TODO maxToRenderPerBatch is impacting initialScrollIndex.
        // maxToRenderPerBatch={20}
        // windowSize={}
        // initialNumToRender={10}
        // maxToRenderPerBatch={}
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
      {showButton && (
        <FloatingScrollButton
          icon={AppIcons.scrollDown}
          onPress={handleScrollButtonPress}
          displayPosition={forumData ? (forumData.isLocked ? 'bottom' : 'raised') : 'bottom'}
        />
      )}
      {/*<PrimaryActionButton*/}
      {/*  buttonText={'Derp'}*/}
      {/*  onPress={() => {*/}
      {/*    console.info('WEEEEEEE');*/}
      {/*    flatListRef.current?.scrollToIndex({*/}
      {/*      index: initialScrollIndex,*/}
      {/*      animated: true,*/}
      {/*    });*/}
      {/*  }}*/}
      {/*/>*/}
    </>
  );
};
