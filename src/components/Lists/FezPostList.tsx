import {FezData, FezPostData} from '../../libraries/Structs/ControllerStructs.tsx';
import {FlashList, ListRenderItemInfo} from '@shopify/flash-list';
import {FezPostListItem} from './Items/FezPostListItem.tsx';
import {PaddedContentView} from '../Views/Content/PaddedContentView.tsx';
import React, {useRef, useState} from 'react';
import {FloatingScrollButton} from '../Buttons/FloatingScrollButton.tsx';
import {RefreshControlProps} from 'react-native';
import {SpaceDivider} from './Dividers/SpaceDivider.tsx';
import {Text} from 'react-native-paper';

interface FezPostListProps {
  data?: FezPostData[];
  fez: FezData;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadPrevious?: () => void;
  hasPrevious?: boolean;
}

export const FezPostList = ({data, fez, refreshControl, handleLoadPrevious, hasPrevious}: FezPostListProps) => {
  const listRef = useRef<FlashList<FezPostData>>(null);
  const [showButton, setShowButton] = useState(false);

  const renderItem = ({item}: ListRenderItemInfo<FezPostData>) => {
    return (
      <PaddedContentView padBottom={false}>
        <FezPostListItem fezPost={item} fez={fez} />
      </PaddedContentView>
    );
  };

  // useCallback() didn't change any number of renders
  const handleScroll = (event: any) => {
    // I picked 450 out of a hat. Roughly 8 messages @ 56 units per message.
    setShowButton(event.nativeEvent.contentOffset.y > 450);
  };

  // Because of the inversion / up-is-down nonsense, we use scrollToOffset
  // rather than scrollToEnd.
  // useCallback() didn't change any number of renders
  const scrollToBottom = () => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  const renderHeader = () => {
    return (
      <PaddedContentView padTop={true}>
        {!hasPrevious && (
          <Text variant={'labelMedium'}>You've reached the beginning of this Seamail conversation.</Text>
        )}
      </PaddedContentView>
    );
  };

  return (
    <>
      <FlashList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        onScroll={handleScroll}
        ItemSeparatorComponent={SpaceDivider}
        refreshControl={refreshControl}
        keyExtractor={(item: FezPostData) => String(item.postID)}
        ListFooterComponent={renderHeader}
        onEndReached={handleLoadPrevious}
        estimatedItemSize={65}
        inverted={true}
        // maintainVisibleContentPosition did not help with any of the inverted
        // scroll positioning. The only quirk noticed so far is when you load
        // a conversation that has many unread messages.
      />
      {showButton && <FloatingScrollButton onPress={scrollToBottom} displayPosition={'raised'} />}
    </>
  );
};
