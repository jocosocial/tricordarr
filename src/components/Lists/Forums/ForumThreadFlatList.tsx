import {FlatList, RefreshControlProps} from 'react-native';
import {ForumThreadListItem} from '../Items/Forum/ForumThreadListItem';
import React, {useCallback, useRef, useState} from 'react';
import {ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {Divider} from 'react-native-paper';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {TimeDivider} from '../Dividers/TimeDivider';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';

interface ForumThreadFlatListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  forumListData: ForumListData[];
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
  maintainViewPosition?: boolean;
}

export const ForumThreadFlatList = ({
  forumListData,
  refreshControl,
  handleLoadNext,
  handleLoadPrevious,
  maintainViewPosition,
}: ForumThreadFlatListProps) => {
  const flatListRef = useRef<FlatList<ForumListData>>(null);
  const [showButton, setShowButton] = useState(false);
  const {commonStyles} = useStyles();
  const renderSeparator = useCallback(() => <Divider bold={true} />, []);
  const renderListHeader = () => {
    if (forumListData.length === 0) {
      return <TimeDivider label={'No forums to display'} />;
    }
    return <Divider bold={true} />;
  };
  const renderListFooter = () => {
    if (forumListData.length !== 0) {
      return <Divider bold={true} />;
    }
  };
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
        style={forumListData.length === 0 ? commonStyles.paddingHorizontal : undefined}
        refreshControl={refreshControl}
        data={forumListData}
        renderItem={({item}) => <ForumThreadListItem forumData={item} />}
        onEndReached={handleLoadNext}
        // onStartReached={handleLoadPrevious}
        maintainVisibleContentPosition={maintainViewPosition ? {minIndexForVisible: 0} : undefined}
        keyExtractor={(item: ForumListData) => item.forumID}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        onScroll={handleScroll}
      />
      {showButton && (
        <FloatingScrollButton icon={AppIcons.scrollUp} onPress={handleScrollButtonPress} displayPosition={'top'} />
      )}
    </>
  );
};
