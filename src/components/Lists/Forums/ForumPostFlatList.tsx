import {FezData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React, {useRef, useState} from 'react';
import {Button, Divider, Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

interface ForumPostFlatListProps {
  postList: PostData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: ((info: {distanceFromEnd: number}) => void) | null | undefined;
  onStartReached?: ((info: {distanceFromStart: number}) => void) | null | undefined;
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
  onEndReached,
  onStartReached,
  fetchPreviousPage,
}: ForumPostFlatListProps) => {
  const getListHeader = () => <Button onPress={onPrevious}>Load More</Button>;
  const flatListRef = useRef<FlatList<PostData>>(null);
  // const scrollPositionRef = useRef();
  const [position, setPosition] = useState(0);

  const onChange = () => {
    // flatListRef.current?.scrollToOffset({animated: false, offset: position});
    console.log(position);
  };

  const onPrevious = () => {
    fetchPreviousPage();
    console.log('Position', position);
    // flatListRef.current.scrollToOffset({animated: false, offset: position});
    // flatListRef.current.scrollToItem({animated: false, item: postList[postList.length - 1]});
    // flatListRef.current.scrollToEnd();
  };

  const handleContentSizeChange = () => {
    console.log('content has changed');
  };

  const handleScroll = (event) => {
    setPosition(event.nativeEvent.contentOffset.y);
    console.log('Scroll!', event.nativeEvent.contentOffset.y);
  };

  const handleLayout = event => {
    console.log('New Layout', event.nativeEvent.layout.height);
  };

  return (
    <FlatList
      onLayout={handleLayout}
      ref={flatListRef}
      refreshControl={refreshControl}
      ItemSeparatorComponent={ListSeparator}
      // ListHeaderComponent={SeamailListHeader}
      ListFooterComponent={ListSeparator}
      onEndReached={onEndReached}
      // onStartReached={onStartReached}
      data={postList}
      renderItem={({item}) => <Text>{item.text}</Text>}
      // initialScrollIndex={5}
      onScrollToIndexFailed={(info) => console.log('fail!', info)}
      ListHeaderComponent={getListHeader}
      onContentSizeChange={handleContentSizeChange}
      // onViewableItemsChanged={onChange}
      onScroll={handleScroll}
    />
  );
};
