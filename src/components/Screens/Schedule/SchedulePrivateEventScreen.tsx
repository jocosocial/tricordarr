import {AppView} from '../../Views/AppView.tsx';
import {ScheduleFlatList} from '../../Lists/Schedule/ScheduleFlatList.tsx';
import {usePersonalEventsQuery} from '../../Queries/PersonalEvent/PersonalEventQueries.ts';
import {FezType} from '../../../libraries/Enums/FezType.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import React, {useCallback, useEffect, useRef} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FlashList} from '@shopify/flash-list';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderScheduleYourDayButton} from '../../Buttons/HeaderButtons/HeaderScheduleYourDayButton.tsx';
import {ScheduleEventFilterMenu} from '../../Menus/Schedule/ScheduleEventFilterMenu.tsx';
import {ScheduleDayScreenActionsMenu} from '../../Menus/Schedule/ScheduleDayScreenActionsMenu.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

export const SchedulePrivateEventScreen = () => {
  const {data, isFetching, refetch} = usePersonalEventsQuery({
    includeType: [FezType.privateEvent],
  });
  const listRef = useRef<FlashList<FezData>>(null);
  const navigation = useCommonStack();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
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
      <ScheduleFlatList
        items={data.pages.flatMap(p => p.fezzes)}
        listRef={listRef}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        separator={'day'}
      />
    </AppView>
  );
};
