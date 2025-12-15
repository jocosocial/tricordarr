import {type FlashListRef} from '@shopify/flash-list';
import React, {SetStateAction, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {SchedulePersonalEventCreateFAB} from '#src/Components/Buttons/FloatingActionButtons/SchedulePersonalEventCreateFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {LFGFlatList} from '#src/Components/Lists/Schedule/LFGFlatList';
import {LfgFilterMenu} from '#src/Components/Menus/LFG/LfgFilterMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {usePersonalEventsQuery} from '#src/Queries/Fez/FezQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {FezData} from '#src/Structs/ControllerStructs';

export const SchedulePrivateEventsScreen = () => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/privateevent/list'}>
        <SchedulePrivateEventsScreenInner />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const SchedulePrivateEventsScreenInner = () => {
  const {lfgHidePastFilter} = useFilter();
  const {adjustedCruiseDayToday} = useCruise();
  const {commonStyles} = useStyles();
  const listRef = useRef<FlashListRef<FezData>>(null);
  const navigation = useCommonStack();
  const [items, setItems] = useState<FezData[]>([]);
  // Default to day 1 if cruise context isn't ready yet
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(adjustedCruiseDayToday || 1);
  const [isSwitchingDays, setIsSwitchingDays] = useState(false);

  // Wrapper to clear list immediately when day changes (not in useEffect which runs after render)
  const handleSetCruiseDay = useCallback((day: SetStateAction<number>) => {
    setItems([]); // Clear list immediately
    setIsSwitchingDays(true); // Mark that we're switching days
    setSelectedCruiseDay(day);
    listRef.current?.scrollToOffset({offset: 0, animated: false}); // Reset scroll position
  }, []);

  const {data, isFetching, isError, refetch, hasNextPage, fetchNextPage} = usePersonalEventsQuery({
    fezType: [FezType.privateEvent, FezType.personalEvent],
    // @TODO we intend to change this some day. Upstream Swiftarr issue.
    cruiseDay: selectedCruiseDay - 1,
    hidePast: lfgHidePastFilter,
  });

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <LfgFilterMenu showTypes={false} />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.scheduleHelpScreen)}
          />
        </MaterialHeaderButtons>
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
      setIsSwitchingDays(false); // Data loaded, no longer switching days
    }
  }, [data]);

  // Reset switching state on error to prevent stuck loading spinner
  useEffect(() => {
    if (isError) {
      setIsSwitchingDays(false);
    }
  }, [isError]);

  const localStyles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          ...commonStyles.flex,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [commonStyles.flex],
  );

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScheduleHeaderView selectedCruiseDay={selectedCruiseDay} setCruiseDay={handleSetCruiseDay} />
      <View style={[commonStyles.flex]}>
        {isSwitchingDays ? (
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <LFGFlatList
            items={items}
            listRef={listRef}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
            separator={'day'}
            hasNextPage={hasNextPage}
            handleLoadNext={fetchNextPage}
          />
        )}
      </View>
      <SchedulePersonalEventCreateFAB />
    </AppView>
  );
};
