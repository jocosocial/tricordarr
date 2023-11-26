import {FezData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, ScrollView, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React, {useRef, useState} from 'react';
import {Button, Divider, Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface ForumPostFlatListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  // onEndReached?: ((info: {distanceFromEnd: number}) => void) | null | undefined;
  // onStartReached?: ((info: {distanceFromStart: number}) => void) | null | undefined;
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
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
}: ForumPostFlatListProps) => {
  const getListHeader = () => (
    <PaddedContentView invertVertical={false} padBottom={false}>
      <Button onPress={handleLoadPrevious}>Load More</Button>
    </PaddedContentView>
  );
  const getListFooter = () => (
    <PaddedContentView invertVertical={false} padBottom={false}>
      <Button onPress={handleLoadNext}>Load More</Button>
    </PaddedContentView>
  );
  const flatListRef = useRef<FlatList<PostData>>(null);
  // const scrollPositionRef = useRef();
  const [position, setPosition] = useState(0);
  const {commonStyles} = useStyles();

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

  const handleScroll = event => {
    setPosition(event.nativeEvent.contentOffset.y);
    console.log('Scroll!', event.nativeEvent.contentOffset.y);
  };

  const handleLayout = event => {
    console.log('New Layout', event.nativeEvent.layout.height);
  };

  // , autoscrollToTopThreshold: 10
  return (
    <ScrollView
      refreshControl={refreshControl}
      maintainVisibleContentPosition={{minIndexForVisible: 0}}>
      {getListHeader()}
      {postList.map((item, index) => (
        <PaddedContentView key={index} invertVertical={false} padBottom={true}>
          <Text>{item.text}</Text>
        </PaddedContentView>
      ))}
      {getListFooter()}
    </ScrollView>
  );

  // return (
  //   <FlatList
  //     // onLayout={handleLayout}
  //     ref={flatListRef}
  //     refreshControl={refreshControl}
  //     // ItemSeparatorComponent={ListSeparator}
  //     // ListHeaderComponent={SeamailListHeader}
  //     // ListFooterComponent={ListSeparator}
  //     // onEndReached={handleLoadNext}
  //     // onStartReached={handleLoadPrevious}
  //     // // onStartReached={onStartReached}
  //     data={postList}
  //     renderItem={({item}) => (
  //       <PaddedContentView invertVertical={false} padBottom={true}>
  //         <Text>{item.text}</Text>
  //       </PaddedContentView>
  //     )}
  //     // // initialScrollIndex={5}
  //     // onScrollToIndexFailed={(info) => console.log('fail!', info)}
  //     ListFooterComponent={getListFooter}
  //     ListHeaderComponent={getListHeader}
  //     // onContentSizeChange={handleContentSizeChange}
  //     // // onViewableItemsChanged={onChange}
  //     onScroll={handleScroll}
  //     // style={commonStyles.verticallyInverted}
  //     // initialNumToRender={postList.length}
  //     maintainVisibleContentPosition={{minIndexForVisible: 0, autoscrollToTopThreshold: 10}}
  //   />
  // );
};
