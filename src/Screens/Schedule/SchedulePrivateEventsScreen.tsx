import {AppView} from '#src/Views/AppView.tsx';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import React, {useCallback, useEffect, useRef} from 'react';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {FlashList} from '@shopify/flash-list';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens.tsx';
import {LfgCruiseDayFilterMenu} from '#src/Menus/LFG/LfgCruiseDayFilterMenu.tsx';
import {useFilter} from '#src/Context/Contexts/FilterContext.ts';
import {LfgFilterMenu} from '#src/Menus/LFG/LfgFilterMenu.tsx';
import {LFGFlatList} from '#src/Lists/Schedule/LFGFlatList.tsx';
import {usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries.ts';
import {SchedulePersonalEventCreateFAB} from '#src/Buttons/FloatingActionButtons/SchedulePersonalEventCreateFAB.tsx';

export const SchedulePrivateEventsScreen = () => {
  const {lfgCruiseDayFilter, lfgHidePastFilter} = useFilter();
  const {data, isFetching, refetch, hasNextPage, fetchNextPage} = usePersonalEventsQuery({
    fezType: [FezType.privateEvent, FezType.personalEvent],
    // @TODO we intend to change this some day. Upstream Swiftarr issue.
    cruiseDay: lfgCruiseDayFilter ? lfgCruiseDayFilter - 1 : undefined,
    hidePast: lfgHidePastFilter,
  });
  const listRef = useRef<FlashList<FezData>>(null);
  const navigation = useCommonStack();

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

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <LFGFlatList
        items={data.pages.flatMap(p => p.fezzes)}
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
