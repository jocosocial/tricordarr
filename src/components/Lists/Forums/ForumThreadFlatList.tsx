import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps, View} from 'react-native';
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
import {styleDefaults} from '../../../styles';

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
  keyExtractor?: (item: ForumListData) => string;
  onScrollThreshold?: (value: boolean) => void;
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
  keyExtractor = (item: ForumListData) => item.forumID,
  onScrollThreshold,
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    let scrollThresholdCondition = event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold;
    setShowButton(scrollThresholdCondition);
    if (onScrollThreshold) {
      onScrollThreshold(scrollThresholdCondition);
    }
  };

  const renderItem = useCallback(
    ({item}: {item: ForumListData}) => {
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
        // onEndReachedThreshold is measured in units of visible area.
        // So visible area of the list is 1.0. Do the maths from there.
        // At a standard page size of 50 it is safe to aggressively
        // load next pages.
        onEndReachedThreshold={5}
        estimatedItemSize={170}
        extraData={[enableSelection]}
      />
      {showButton && (
        <FloatingScrollButton icon={AppIcons.scrollUp} onPress={handleScrollButtonPress} displayPosition={'bottom'} />
      )}
    </>
  );
};
