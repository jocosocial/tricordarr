import {RefreshControlProps, View} from 'react-native';
import {ForumThreadListItem} from '../Items/Forum/ForumThreadListItem';
import React, {useCallback, useRef, useState} from 'react';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs';
import {Divider, Text} from 'react-native-paper';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {LabelDivider} from '../Dividers/LabelDivider';
import {useAppTheme} from '../../../styles/Theme';
import {FlashList} from '@shopify/flash-list';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';

interface ForumThreadFlatListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  forumListData: ForumListData[];
  handleLoadNext: () => void;
  handleLoadPrevious: () => void;
  maintainViewPosition?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  pinnedThreads?: ForumListData[];
  categoryID?: string;
  keyExtractor: (item: ForumListData) => string;
}

export const ForumThreadFlatList = ({
  forumListData,
  refreshControl,
  handleLoadNext,
  maintainViewPosition,
  hasNextPage,
  hasPreviousPage,
  pinnedThreads = [],
  categoryID,
  keyExtractor,
}: ForumThreadFlatListProps) => {
  const flatListRef = useRef<FlashList<ForumListData>>(null);
  const [showButton, setShowButton] = useState(false);
  const {commonStyles} = useStyles();
  const renderSeparator = useCallback(() => <Divider bold={true} />, []);
  const theme = useAppTheme();
  const {enableSelection, setEnableSelection, selectedForums} = useSelection();

  const renderListHeader = () => {
    // Turning this off because the list renders too quickly based on the state data.
    // if (forumListData.length === 0) {
    //   return <TimeDivider label={'No forums to display'} />;
    // }
    if (hasPreviousPage) {
      return (
        <PaddedContentView>
          <View style={[commonStyles.flexRow]}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
              <Text variant={'labelMedium'}>Loading...</Text>
            </View>
          </View>
        </PaddedContentView>
      );
    }
    if (forumListData.length !== 0) {
      if (!pinnedThreads || pinnedThreads.length === 0) {
        return <Divider bold={true} />;
      }
      return (
        <View>
          <LabelDivider
            label={'Pinned Threads'}
            color={theme.colors.onBackground}
            wrapperStyle={[commonStyles.marginTopZero]}
            dividerColor={theme.colors.outlineVariant}
          />
          {pinnedThreads.map(item => renderItem({item}))}
          <LabelDivider
            label={'End of Pinned Threads'}
            color={theme.colors.onBackground}
            wrapperStyle={[commonStyles.marginTopZero, commonStyles.marginBottomSmall]}
            dividerColor={theme.colors.outlineVariant}
          />
        </View>
      );
    }
    return null;
  };

  const renderListFooter = () => {
    if (hasNextPage) {
      return (
        <PaddedContentView>
          <View style={[commonStyles.flexRow]}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.flex]}>
              <Text variant={'labelMedium'}>Loading...</Text>
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

  // const handleSelection = (item: ForumListData, selected: boolean) => {
  //   if (selected) {
  //     setSelectedItems(selectedItems.filter(i => i.forumID !== item.forumID));
  //   } else {
  //     setSelectedItems(selectedItems.concat(item));
  //   }
  // };

  const renderItem = useCallback(
    ({item}: {item: ForumListData}) => {
      // let selected = false;
      // if (enableSelection) {
      //   selected = !!selectedItems.find(i => i.forumID === item.forumID);
      // }
      return (
        <ForumThreadListItem
          forumListData={item}
          categoryID={categoryID}
          enableSelection={enableSelection}
          setEnableSelection={setEnableSelection}
          selected={selectedForums.some(i => i.forumID === item.forumID)}
        />
      );
    },
    [categoryID, enableSelection, selectedForums, setEnableSelection],
  );

  return (
    <>
      <FlashList
        ref={flatListRef}
        refreshControl={refreshControl}
        data={forumListData}
        renderItem={renderItem}
        onEndReached={handleLoadNext}
        maintainVisibleContentPosition={maintainViewPosition ? {minIndexForVisible: 0} : undefined}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        onScroll={handleScroll}
        onEndReachedThreshold={10}
        estimatedItemSize={170}
        extraData={[enableSelection]}
      />
      {showButton && (
        <FloatingScrollButton icon={AppIcons.scrollUp} onPress={handleScrollButtonPress} displayPosition={'bottom'} />
      )}
    </>
  );
};
