import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {EventFeedbackReportListItem} from '#src/Components/Lists/Items/Admin/EventFeedbackReportListItem';
import {EventFeedbackLocationFilterMenu} from '#src/Components/Menus/EventFeedback/EventFeedbackLocationFilterMenu';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {ScheduleHeaderView} from '#src/Components/Views/Schedule/ScheduleHeaderView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {calcCruiseDayTime} from '#src/Libraries/DateTime';
import {getRoomName, getUniqueRoomNames} from '#src/Libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackReportsQuery} from '#src/Queries/Admin/EventFeedbackQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {EventFeedbackReport} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminEventFeedbackReportsScreen>;

type EventFeedbackReportWithId = EventFeedbackReport & {id: string};

/**
 * Admin list of shadow event feedback reports.
 */
export const AdminEventFeedbackReportsScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminEventFeedbackReportsScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminEventFeedbackReportsScreenInner = ({navigation, route}: Props) => {
  const listRef = useRef<FlashListRef<EventFeedbackReportWithId>>(null);
  const {data: reports, refetch, isLoading} = useEventFeedbackReportsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const [locationName, setLocationName] = useState<string | undefined>(undefined);
  const [selectedCruiseDay, setSelectedCruiseDay] = useState(0);
  const {startDate, endDate} = useCruise();
  const {tzAtTime} = useTimeZone();
  const locationParam = route.params?.location;
  const userIDParam = route.params?.userID;
  const hasQueryFilter = Boolean(locationParam || userIDParam);

  const reportsWithIds = useMemo(
    () => (reports ?? []).filter((report): report is EventFeedbackReportWithId => !!report.id),
    [reports],
  );

  const locations = useMemo(
    () => getUniqueRoomNames(reportsWithIds.map(report => report.eventLocation)),
    [reportsWithIds],
  );

  const filteredReports = useMemo(() => {
    let result = reportsWithIds;
    if (locationParam) {
      const selectedRoom = locationParam.toLowerCase();
      result = result.filter(report => getRoomName(report.eventLocation).toLowerCase() === selectedRoom);
    }
    if (userIDParam) {
      result = result.filter(report => report.reportingUser.userID === userIDParam);
    }
    if (!hasQueryFilter && locationName) {
      const selectedRoom = locationName.toLowerCase();
      result = result.filter(report => getRoomName(report.eventLocation).toLowerCase() === selectedRoom);
    }
    if (!hasQueryFilter && selectedCruiseDay !== 0) {
      result = result.filter(
        report =>
          calcCruiseDayTime(new Date(report.eventTime), startDate, endDate, tzAtTime).cruiseDay === selectedCruiseDay,
      );
    }
    return result;
  }, [
    endDate,
    hasQueryFilter,
    locationName,
    locationParam,
    reportsWithIds,
    selectedCruiseDay,
    startDate,
    tzAtTime,
    userIDParam,
  ]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          {!hasQueryFilter && (
            <>
              <Item
                title={'Stats'}
                iconName={AppIcons.statistics}
                onPress={() => navigation.push(CommonStackComponents.adminEventFeedbackStatsScreen)}
              />
              <EventFeedbackLocationFilterMenu
                locations={locations}
                locationName={locationName}
                onLocationChange={setLocationName}
              />
            </>
          )}
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.eventFeedbackHelpScreen, {mode: 'admin'})}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [hasQueryFilter, locationName, locations, navigation]);

  const renderItem = useCallback(({item}: {item: EventFeedbackReportWithId}) => {
    return <EventFeedbackReportListItem report={item} />;
  }, []);

  const renderListFooter = useCallback(() => {
    if (filteredReports.length > 0) {
      return <EndResultsFooter />;
    }
    return <NoResultsFooter />;
  }, [filteredReports.length]);

  const renderItemSeparator = useCallback(() => {
    return <Divider bold={true} />;
  }, []);

  const keyExtractor = useCallback((item: EventFeedbackReportWithId) => item.id, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading && !reports) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {!hasQueryFilter && (
        <ScheduleHeaderView
          selectedCruiseDay={selectedCruiseDay}
          setCruiseDay={setSelectedCruiseDay}
          enableAll={true}
        />
      )}
      {locationParam && <ListTitleView title={locationParam} />}
      {userIDParam && filteredReports[0]?.reportingUser && (
        <ListTitleView title={getUserBylineString(filteredReports[0].reportingUser, false, true, 'Reports by')} />
      )}
      <AppFlashList<EventFeedbackReportWithId>
        ref={listRef}
        data={filteredReports}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderListFooter={renderListFooter}
        renderItemSeparator={renderItemSeparator}
      />
    </AppView>
  );
};
