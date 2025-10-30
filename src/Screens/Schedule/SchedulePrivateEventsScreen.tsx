import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {SchedulePersonalEventCreateFAB} from '#src/Components/Buttons/FloatingActionButtons/SchedulePersonalEventCreateFAB';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {LFGFlatList} from '#src/Components/Lists/Schedule/LFGFlatList';
import {LfgCruiseDayFilterMenu} from '#src/Components/Menus/LFG/LfgCruiseDayFilterMenu';
import {LfgFilterMenu} from '#src/Components/Menus/LFG/LfgFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {FezData} from '#src/Structs/ControllerStructs';

export const SchedulePrivateEventsScreen = () => {
  const {lfgCruiseDayFilter, lfgHidePastFilter} = useFilter();
  const {data, isFetching, refetch, hasNextPage, fetchNextPage} = usePersonalEventsQuery({
    fezType: [FezType.privateEvent, FezType.personalEvent],
    // @TODO we intend to change this some day. Upstream Swiftarr issue.
    cruiseDay: lfgCruiseDayFilter ? lfgCruiseDayFilter - 1 : undefined,
    hidePast: lfgHidePastFilter,
  });
  const listRef = useRef<FlashListRef<FezData>>(null);
  const navigation = useCommonStack();
  const [items, setItems] = useState<FezData[]>([]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <LfgCruiseDayFilterMenu />
          <LfgFilterMenu showTypes={false} />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.scheduleHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  /**
   * Effect to set the items when the data loads. This was necessary because the
   * list would infinitely re-render with this lambda as the items prop.
   */
  useEffect(() => {
    if (data) {
      setItems(data.pages.flatMap(page => page.fezzes));
    }
  }, [data]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <LFGFlatList
        items={items}
        listRef={listRef}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        separator={'day'}
        hasNextPage={hasNextPage}
        handleLoadNext={fetchNextPage}
      />
      <SchedulePersonalEventCreateFAB />
    </AppView>
  );
};
