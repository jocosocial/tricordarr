import {FlatList, RefreshControlProps} from 'react-native';
import {ForumThreadListItem} from '../Items/Forum/ForumThreadListItem';
import React, {useCallback, useRef, useState} from 'react';
import {ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {Divider} from 'react-native-paper';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface ForumThreadFlatListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  forumListData: ForumListData[];
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
}

export const ForumThreadFlatList = ({
  forumListData,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
}: ForumThreadFlatListProps) => {
  const flatListRef = useRef<FlatList<ForumListData>>(null);
  const {commonStyles} = useStyles();
  const [showButton, setShowButton] = useState(false);
  const renderSeparator = useCallback(() => <Divider bold={true} />, []);
  const handleScrollButtonPress = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };
  const handleScroll = (event: any) => {
    // I picked 450 out of a hat. Roughly 8 messages @ 56 units per message.
    setShowButton(event.nativeEvent.contentOffset.y > 450);
  };
  return (
    <>
      <FlatList
        ref={flatListRef}
        // style={commonStyles.paddingHorizontal}
        refreshControl={refreshControl}
        data={forumListData}
        renderItem={({item}) => <ForumThreadListItem forumData={item} />}
        onEndReached={handleLoadNext}
        // onStartReached={handleLoadPrevious}
        maintainVisibleContentPosition={{minIndexForVisible: 0}}
        keyExtractor={(item: ForumListData) => item.forumID}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderSeparator}
        ListFooterComponent={renderSeparator}
        onScroll={handleScroll}
      />
      {showButton && (
        <FloatingScrollButton icon={AppIcons.scrollUp} onPress={handleScrollButtonPress} displayPosition={'top'} />
      )}
    </>
  );
};
