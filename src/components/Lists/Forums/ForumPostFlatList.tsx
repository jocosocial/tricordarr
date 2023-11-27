import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControlProps, FlatList, View} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {Button} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {ForumPostListItem} from '../Items/Forum/ForumPostListItem';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {timeAgo} from '../../../libraries/DateTime';

interface ForumPostFlatListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
  itemSeparator?: 'time';
}

export const ForumPostFlatList = ({
  postList,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
  itemSeparator,
}: ForumPostFlatListProps) => {
  const flatListRef = useRef<FlatList<PostData>>(null);
  // const scrollPositionRef = useRef();
  const [position, setPosition] = useState(0);
  const {commonStyles} = useStyles();
  const [showButton, setShowButton] = useState(false);

  const onChange = () => {
    // flatListRef.current?.scrollToOffset({animated: false, offset: position});
    console.log(position);
  };

  // const onPrevious = () => {
  //   fetchPreviousPage();
  //   console.log('Position', position);
  //   // flatListRef.current.scrollToOffset({animated: false, offset: position});
  //   // flatListRef.current.scrollToItem({animated: false, item: postList[postList.length - 1]});
  //   // flatListRef.current.scrollToEnd();
  // };

  const handleContentSizeChange = () => {
    console.log('content has changed');
  };

  const handleScroll = (event: any) => {
    // I picked 450 out of a hat. Roughly 8 messages @ 56 units per message.
    setShowButton(event.nativeEvent.contentOffset.y > 450);
  };

  const handleLayout = event => {
    console.log('New Layout', event.nativeEvent.layout.height);
  };

  const scrollToBottom = () => {
    // flatListRef.current?.scrollToEnd({animated: false});
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  // , autoscrollToTopThreshold: 10
  // return (
  //   <ScrollView
  //     refreshControl={refreshControl}
  //     maintainVisibleContentPosition={{minIndexForVisible: 0}}>
  //     {getListHeader()}
  //     {postList.map((item, index) => (
  //       <PaddedContentView key={index} invertVertical={false} padBottom={true}>
  //         <Text>{item.text}</Text>
  //       </PaddedContentView>
  //     ))}
  //     {getListFooter()}
  //   </ScrollView>
  // );

  // const showNewDivider = useCallback(
  //   (index: number) => {
  //     if (forumData. === fez.members.readCount) {
  //       return false;
  //     }
  //     // index is inverted so the last message in the list is 0.
  //     // Add one to the readCount so that we render below the message at the readCount.
  //     return fez.members.postCount - index === fez.members.readCount + 1;
  //   },
  //   [forumData],
  // );

  const renderItem = useCallback(
    ({item}: {item: PostData}) => (
      <View style={commonStyles.verticallyInverted}>
        <ForumPostListItem postData={item} />
      </View>
    ),
    [commonStyles.verticallyInverted],
  );

  const renderSeparator = useCallback(
    ({leadingItem}: {leadingItem: PostData}) => {
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

      return <TimeDivider label={timeAgo.format(leadingDate, 'round')} style={commonStyles.verticallyInverted} />;
    },
    [commonStyles.verticallyInverted, itemSeparator, postList],
  );

  const renderListHeader = useCallback(() => {
    if (!itemSeparator) {
      return <SpaceDivider />;
    }
    if (postList.length === 0) {
      return <TimeDivider label={'No mentions'} />;
    }
    const lastItem = postList[postList.length - 1];
    if (!lastItem.createdAt) {
      return <SpaceDivider />;
    }

    let label = timeAgo.format(new Date(lastItem.createdAt), 'round');
    return <TimeDivider style={commonStyles.verticallyInverted} label={label} />;
  }, [commonStyles.verticallyInverted, itemSeparator, postList]);

  const renderListFooter = useCallback(() => <SpaceDivider />, []);

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlatList
        style={{
          ...commonStyles.paddingHorizontal,
          ...commonStyles.verticallyInverted,
          // ...commonStyles.paddingVertical,
        }}
        // onLayout={handleLayout}
        ref={flatListRef}
        refreshControl={refreshControl}
        // ItemSeparatorComponent={ListSeparator}
        // ListHeaderComponent={SeamailListHeader}
        // ListFooterComponent={ListSeparator}
        // onEndReached={handleLoadNext}
        // onStartReached={handleLoadPrevious}
        // // onStartReached={onStartReached}
        data={postList}
        renderItem={renderItem}
        // // initialScrollIndex={5}
        // onScrollToIndexFailed={(info) => console.log('fail!', info)}
        ListFooterComponent={renderListHeader}
        ListHeaderComponent={renderListFooter}
        // ListHeaderComponent={getListHeader}
        // onContentSizeChange={handleContentSizeChange}
        // // onViewableItemsChanged={onChange}
        onScroll={handleScroll}
        // initialNumToRender={postList.length}
        maintainVisibleContentPosition={{minIndexForVisible: 0}}
        // onStartReached={handleLoadPrevious}
        // onEndReached={handleLoadNext}
        onStartReached={handleLoadNext} // Inverted
        onEndReached={handleLoadPrevious} // Inverted
        // showDefaultLoadingIndicators={false}
        keyExtractor={(item: PostData) => String(item.postID)}
        ItemSeparatorComponent={renderSeparator}
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} />}
    </>
  );
};
