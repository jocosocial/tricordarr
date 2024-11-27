import {SpaceDivider} from './Dividers/SpaceDivider.tsx';
import {FlatList, NativeScrollEvent, NativeSyntheticEvent, RefreshControl} from 'react-native';
import {FezData, FezPostData} from '../../libraries/Structs/ControllerStructs.tsx';
import {PaddedContentView} from '../Views/Content/PaddedContentView.tsx';
import {LabelDivider} from './Dividers/LabelDivider.tsx';
import {FezPostListItem} from './Items/FezPostListItem.tsx';
import React, {useCallback, useState} from 'react';
import {styleDefaults} from '../../styles';
import {FlexCenteredContentView} from '../Views/Content/FlexCenteredContentView.tsx';
import {Text} from 'react-native-paper';
import {ConversationFlatListProps} from './ConversationFlatList.tsx';
import {FloatingScrollButton} from '../Buttons/FloatingScrollButton.tsx';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

interface ChatFlatListProps extends ConversationFlatListProps<FezPostData> {
  fez: FezData;
  fezPostsData: FezPostData[];
}

export const ChatFlatList = ({
  hasPreviousPage,
  flatListRef,
  fez,
  fezPostsData,
  refreshControl,
  handleLoadPrevious,
}: ChatFlatListProps) => {
  const [showButton, setShowButton] = useState(false);
  const {commonStyles} = useStyles();

  const renderHeader = () => {
    return (
      <PaddedContentView padTop={true} invertVertical={true}>
        <FlexCenteredContentView>
          {hasPreviousPage ? (
            <Text variant={'labelMedium'}>Loading...</Text>
          ) : (
            <Text variant={'labelMedium'}>You've reached the beginning of this Seamail conversation.</Text>
          )}
        </FlexCenteredContentView>
      </PaddedContentView>
    );
  };

  // Because of the inversion / up-is-down nonsense, we use scrollToOffset
  // rather than scrollToEnd.
  // useCallback() didn't change any number of renders
  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  // useCallback() didn't change any number of renders
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowButton(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
  };

  const showNewDivider = useCallback(
    (index: number) => {
      if (fez && fez.members) {
        if (fez.members.postCount === fez.members.readCount) {
          return false;
        }
        // index is inverted so the last message in the list is 0.
        // Add one to the readCount so that we render below the message at the readCount.
        return fez.members.postCount - index === fez.members.readCount + 1;
      }
    },
    [fez],
  );

  const renderItem = ({item, index, separators}) => (
    <PaddedContentView invertVertical={true} padBottom={false}>
      {showNewDivider(index) && <LabelDivider label={'New'} />}
      <FezPostListItem fezPost={item} index={index} separators={separators} fez={fez} />
    </PaddedContentView>
  );

  return (
    <>
      <FlatList
        ref={flatListRef}
        // I am not sure about the performance here. onScroll is great but fires A LOT.
        // onScrollBeginDrag={handleScroll}
        // onScrollEndDrag={handleScroll}
        onScroll={handleScroll}
        // This is dumb. Have to take the performance hit to allow selecting text.
        // https://github.com/facebook/react-native/issues/26264
        // Good thing selecting text isn't necessary anymore!
        // removeClippedSubviews={false}
        ItemSeparatorComponent={SpaceDivider}
        data={fezPostsData}
        onEndReachedThreshold={1}
        onStartReachedThreshold={1}
        // Inverted murders performance to the point of locking the app.
        // So we do a series of verticallyInverted, relying on a deprecated style prop.
        // https://github.com/facebook/react-native/issues/30034
        // inverted={true}
        style={commonStyles.verticallyInverted}
        refreshControl={refreshControl}
        keyExtractor={(item: FezPostData) => String(item.postID)}
        // This is the Footer because of all the inversion crap. In our case,
        // footer renders at the top.
        ListFooterComponent={renderHeader}
        renderItem={renderItem}
        // End is Start, Start is End.
        onEndReached={handleLoadPrevious}
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} displayPosition={'raised'} />}
    </>
  );
};
