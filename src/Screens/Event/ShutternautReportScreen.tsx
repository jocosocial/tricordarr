import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {ShutternautReportHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ShutternautReportHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ShutternautReportList} from '#src/Components/Lists/Schedule/ShutternautReportList';
import {AppView} from '#src/Components/Views/AppView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {NotShutternautManagerView} from '#src/Components/Views/Static/NotShutternautManagerView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useCruiseDayPicker} from '#src/Hooks/useCruiseDayPicker';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventPhotographerReportQuery} from '#src/Queries/Events/EventPhotographerQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {ShutternautScheduleReportData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.shutternautReportScreen>;

/**
 * Checkpoint matching Swiftarr's `requirePhotographerReportAccess`: the report is for
 * Shutternaut Managers and TwitarrTeam and above. Everyone else would get a 403.
 */
const ShutternautReportGate = ({children}: PropsWithChildren) => {
  const {hasShutternautManager} = useRoles();
  const {hasTwitarrTeam} = usePrivilege();

  if (!hasShutternautManager && !hasTwitarrTeam) {
    return <NotShutternautManagerView />;
  }
  return children;
};

/**
 * Cruise-wide photography-coverage report for Shutternaut Managers. Native counterpart to
 * Swiftarr's `/events/photographerreport`.
 *
 * No PreRegistrationScreen checkpoint: both report endpoints are marked
 * `setUsedForPreregistration()` in Swiftarr's EventController, so they stay reachable while the
 * server is in pre-registration mode. Matches ScheduleDayScreen and EventLocationScreen.
 */
export const ShutternautReportScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.schedule} urlPath={'/events/photographerreport'}>
        <ShutternautReportGate>
          <ShutternautReportScreenInner {...props} />
        </ShutternautReportGate>
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const ShutternautReportScreenInner = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const listRef = useRef<FlashListRef<ShutternautScheduleReportData>>(null);
  const [reportRows, setReportRows] = useState<ShutternautScheduleReportData[]>([]);

  // The report is a cruise-wide overview, so it opens on All Days rather than today.
  const {selectedCruiseDay, isSwitchingDays, handleSetCruiseDay, onDataLoaded, onQueryError} = useCruiseDayPicker({
    listRef,
    clearList: useCallback(() => setReportRows([]), []),
    defaultCruiseDay: 0,
  });

  const {data, refetch, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useEventPhotographerReportQuery(selectedCruiseDay === 0 ? undefined : {cruiseday: selectedCruiseDay});
  const {refreshing, setRefreshing, onRefresh} = useRefresh({refresh: refetch});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    setRefreshing,
  });

  const getNavButtons = useCallback(() => {
    return <ShutternautReportHeaderButtons selectedCruiseDay={selectedCruiseDay} />;
  }, [selectedCruiseDay]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const items = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);

  useEffect(() => {
    if (data) {
      setReportRows(items);
      onDataLoaded();
    }
  }, [data, items, onDataLoaded]);

  useEffect(() => {
    if (isError) {
      onQueryError();
    }
  }, [isError, onQueryError]);

  return (
    <AppView>
      <ScheduleHeaderView selectedCruiseDay={selectedCruiseDay} setCruiseDay={handleSetCruiseDay} enableAll={true} />
      <View style={commonStyles.flex}>
        {isLoading || isSwitchingDays ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size={'large'} />
          </View>
        ) : (
          <ShutternautReportList
            items={reportRows}
            listRef={listRef}
            handleLoadNext={handleLoadNext}
            hasNextPage={hasNextPage}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>
    </AppView>
  );
};
