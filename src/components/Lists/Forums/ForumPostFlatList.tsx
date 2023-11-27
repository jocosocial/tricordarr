import {FezData, ForumData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControlProps, ScrollView, View, FlatList} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React, {useCallback, useRef, useState} from 'react';
import {Button, Divider, Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {ForumPostListItem} from '../Items/ForumPostListItem';
// import {FlatList} from 'react-native-bidirectional-infinite-scroll';

interface ForumPostFlatListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  // onEndReached?: ((info: {distanceFromEnd: number}) => void) | null | undefined;
  // onStartReached?: ((info: {distanceFromStart: number}) => void) | null | undefined;
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
  forumData: ForumData;
}

const ListSeparator = () => <Divider bold={true} />;

// const SeamailListHeader = () => {
//   const {hasTwitarrTeam, hasModerator} = usePrivilege();
//   return (
//     <View>
//       {(hasTwitarrTeam || hasModerator) && (
//         <PaddedContentView padTop={true}>
//           <SeamailAccountButtons />
//         </PaddedContentView>
//       )}
//       <ListSeparator />
//     </View>
//   );
// };
export const ForumPostFlatList = ({
  postList,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
  forumData,
}: ForumPostFlatListProps) => {
  const getListHeader = () => (
    <PaddedContentView invertVertical={true} padBottom={false}>
      <Button onPress={handleLoadPrevious}>Load Previous</Button>
    </PaddedContentView>
  );
  const getListFooter = () => (
    <PaddedContentView invertVertical={true} padBottom={false}>
      <Button onPress={handleLoadNext}>Load Next</Button>
    </PaddedContentView>
  );
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
    console.log(event.nativeEvent.contentOffset.y);
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

  // https://github.com/facebook/react-native/issues/25239
  return (
    <>
      <FlatList
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
        renderItem={({item, index, separators}) => (
          <PaddedContentView invertVertical={true} padBottom={true}>
            <ForumPostListItem postData={item} index={index} separators={separators} />
          </PaddedContentView>
        )}
        // // initialScrollIndex={5}
        // onScrollToIndexFailed={(info) => console.log('fail!', info)}
        // ListFooterComponent={getListFooter}
        // ListHeaderComponent={getListHeader}
        // onContentSizeChange={handleContentSizeChange}
        // // onViewableItemsChanged={onChange}
        onScroll={handleScroll}
        style={commonStyles.verticallyInverted}
        // initialNumToRender={postList.length}
        maintainVisibleContentPosition={{minIndexForVisible: 0}}
        // onStartReached={handleLoadPrevious}
        // onEndReached={handleLoadNext}
        onStartReached={handleLoadNext} // Inverted
        onEndReached={handleLoadPrevious} // Inverted
        // showDefaultLoadingIndicators={false}
        keyExtractor={(item: PostData) => String(item.postID)}
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} />}
    </>
  );
};
