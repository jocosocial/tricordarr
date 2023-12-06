import {FlatList, RefreshControlProps, View} from 'react-native';
import {ForumThreadListItem} from '../Items/Forum/ForumThreadListItem';
import React, {useCallback, useRef, useState} from 'react';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs';
import {Divider, Text} from 'react-native-paper';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {TimeDivider} from '../Dividers/TimeDivider';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {LabelDivider} from '../Dividers/LabelDivider';
import {useAppTheme} from '../../../styles/Theme';

interface ForumThreadFlatListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  forumListData: ForumListData[];
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
  maintainViewPosition?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export const ForumThreadFlatList = ({
  forumListData,
  refreshControl,
  handleLoadNext,
  maintainViewPosition,
  hasNextPage,
  hasPreviousPage,
}: ForumThreadFlatListProps) => {
  const flatListRef = useRef<FlatList<ForumListData>>(null);
  const [showButton, setShowButton] = useState(false);
  const {commonStyles} = useStyles();
  const renderSeparator = useCallback(() => <Divider bold={true} />, []);
  const theme = useAppTheme();
  const renderListHeader = () => {
    if (forumListData.length === 0) {
      return <TimeDivider label={'No forums to display'} />;
    }
    if (hasPreviousPage) {
      return (
        <PaddedContentView>
          <View style={[commonStyles.flexRow]}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
              <Text variant={'labelMedium'}>Loading more previous...</Text>
            </View>
          </View>
        </PaddedContentView>
      );
    }
    return <Divider bold={true} />;
  };
  const renderListFooter = () => {
    if (hasNextPage) {
      return (
        <PaddedContentView>
          <View style={[commonStyles.flexRow]}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
              <Text variant={'labelMedium'}>Loading more next...</Text>
            </View>
          </View>
        </PaddedContentView>
      );
    }
    if (forumListData.length !== 0) {
      return (
        <LabelDivider
          label={'End of Results'}
          color={theme.colors.onBackground}
          wrapperStyle={[commonStyles.marginTopZero, commonStyles.marginBottomSmall]}
          dividerColor={theme.colors.outlineVariant}
        />
      );
    }
    return <SpaceDivider />;
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
        maintainVisibleContentPosition={maintainViewPosition ? {minIndexForVisible: 0} : undefined}
        keyExtractor={(item: ForumListData) => item.forumID}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        onScroll={handleScroll}
        onEndReachedThreshold={10}
      />
      {showButton && (
        <FloatingScrollButton icon={AppIcons.scrollUp} onPress={handleScrollButtonPress} displayPosition={'top'} />
      )}
    </>
  );
};
