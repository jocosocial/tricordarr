import {FlashList} from '@shopify/flash-list';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import React, {ReactElement, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';
import {LfgCard} from '../../Cards/Schedule/LfgCard.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {TimeDivider} from '../Dividers/TimeDivider.tsx';
import {SpaceDivider} from '../Dividers/SpaceDivider.tsx';
import {getDayMarker, getTimeMarker} from '../../../libraries/DateTime.ts';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {useLFGStackNavigation} from '../../Navigation/Stacks/LFGStackNavigator.tsx';

interface LFGFlatListProps {
  items: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef?: React.RefObject<FlashList<FezData>> | null;
  separator?: 'day' | 'time' | 'none';
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  initialScrollIndex?: number;
}

export const LFGFlatList = ({
  items,
  refreshControl,
  listRef = null,
  listHeader,
  listFooter,
  initialScrollIndex,
  separator = 'time',
}: LFGFlatListProps) => {
  const {commonStyles} = useStyles();
  const navigation = useLFGStackNavigation();

  const renderItem = useCallback(
    ({item}: {item: FezData}) => {
      return (
        <LfgCard
          lfg={item}
          showDay={true}
          onPress={() => navigation.push(CommonStackComponents.lfgScreen, {fezID: item.fezID})}
        />
      );
    },
    [navigation],
  );

  const keyExtractor = useCallback((item: FezData) => item.fezID, []);

  const renderListHeader = useCallback(() => {
    if (!items[0]) {
      return <TimeDivider label={'No LFGs to display'} />;
    }
    const firstItem = items[0];
    if (!firstItem.startTime || !firstItem.timeZoneID) {
      return <SpaceDivider />;
    }

    let label = getTimeMarker(firstItem.startTime, firstItem.timeZoneID);
    if (separator === 'day') {
      label = getDayMarker(firstItem.startTime, firstItem.timeZoneID);
    }
    return <TimeDivider label={label} />;
  }, [items, separator]);

  const renderListFooter = () => <TimeDivider label={'End'} />;

  const renderSeparatorDay = ({leadingItem}: {leadingItem: FezData}) => {
    const leadingIndex = items.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <TimeDivider label={'Leading Unknown?'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const trailingItem = items[trailingIndex];
    if (!leadingItem.startTime || !trailingItem.startTime || !trailingItem.timeZoneID) {
      return <SpaceDivider />;
    }
    const leadingDate = new Date(leadingItem.startTime);
    const trailingDate = new Date(trailingItem.startTime);
    const leadingTimeMarker = leadingDate.getDay();
    const trailingTimeMarker = trailingDate.getDay();
    if (leadingTimeMarker === trailingTimeMarker) {
      return <SpaceDivider />;
    }
    return <TimeDivider label={getDayMarker(trailingItem.startTime, trailingItem.timeZoneID)} />;
  };

  return (
    <FlashList
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderSeparatorDay}
      data={items}
      renderItem={renderItem}
      ListHeaderComponent={listHeader || renderListHeader}
      ListFooterComponent={listFooter || renderListFooter}
      ref={listRef}
      keyExtractor={keyExtractor}
      initialScrollIndex={initialScrollIndex}
      estimatedItemSize={161}
      contentContainerStyle={{
        ...commonStyles.paddingHorizontal,
      }}
    />
  );
};
