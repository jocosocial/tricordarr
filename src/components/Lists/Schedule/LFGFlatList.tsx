import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import React, {ReactElement, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';
import {LfgCard} from '../../Cards/Schedule/LfgCard.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {useLFGStackNavigation} from '../../Navigation/Stacks/LFGStackNavigator.tsx';
import {ScheduleFlatListBase} from './ScheduleFlatListBase.tsx';
import {ScheduleFlatListSeparator} from '../../../libraries/Types';
import {FlashList} from '@shopify/flash-list';

interface LFGFlatListProps {
  items: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlashList<FezData>>;
  separator?: ScheduleFlatListSeparator;
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  initialScrollIndex?: number;
  onScrollThreshold?: (condition: boolean) => void;
  hasNextPage?: boolean;
  handleLoadPrevious?: () => void;
  handleLoadNext?: () => void;
}

export const LFGFlatList = ({
  items,
  refreshControl,
  separator = 'day',
  listRef,
  onScrollThreshold,
  handleLoadNext,
  handleLoadPrevious,
  hasNextPage,
}: LFGFlatListProps) => {
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

  return (
    <ScheduleFlatListBase
      listRef={listRef}
      keyExtractor={keyExtractor}
      items={items}
      renderItem={renderItem}
      separator={separator}
      refreshControl={refreshControl}
      onScrollThreshold={onScrollThreshold}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      hasNextPage={hasNextPage}
      estimatedItemSize={161}
    />
  );
};
