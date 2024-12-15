import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import React, {ReactElement, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {useLFGStackNavigation} from '../../Navigation/Stacks/LFGStackNavigator.tsx';
import {ScheduleFlatListBase} from './ScheduleFlatListBase.tsx';
import {ScheduleFlatListSeparator} from '../../../libraries/Types';
import {FlashList} from '@shopify/flash-list';
import {FezCard} from '../../Cards/Schedule/FezCard.tsx';

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
  renderItem?: ({item}: {item: FezData}) => React.JSX.Element;
  enableReportOnly?: boolean;
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
  renderItem,
  enableReportOnly,
  listHeader,
}: LFGFlatListProps) => {
  const navigation = useLFGStackNavigation();

  const renderItemDefault = useCallback(
    ({item}: {item: FezData}) => {
      return (
        <FezCard
          fez={item}
          showDay={true}
          onPress={() => navigation.push(CommonStackComponents.lfgScreen, {fezID: item.fezID})}
          enableReportOnly={enableReportOnly}
        />
      );
    },
    [navigation, enableReportOnly],
  );

  const keyExtractor = useCallback((item: FezData) => item.fezID, []);

  return (
    <ScheduleFlatListBase
      listRef={listRef}
      keyExtractor={keyExtractor}
      items={items}
      renderItem={renderItem || renderItemDefault}
      separator={separator}
      refreshControl={refreshControl}
      onScrollThreshold={onScrollThreshold}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      hasNextPage={hasNextPage}
      estimatedItemSize={161}
      listHeader={listHeader}
    />
  );
};
