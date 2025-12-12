import Clipboard from '@react-native-clipboard/clipboard';
import moment from 'moment-timezone';
import React, {useCallback, useEffect} from 'react';
import {Linking, RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useTimeZoneChangesQuery} from '#src/Queries/Admin/TimeZoneQueries';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {TimeZoneChangeRecord} from '#src/Structs/ControllerStructs';

const getCleanISOString = (dateString: string): string => {
  return new Date(dateString).toISOString().split('.')[0] + 'Z';
};

const TimeZoneListItem = ({record}: {record: TimeZoneChangeRecord}) => {
  return (
    <DataFieldListItem
      title={`${record.timeZoneID} (${record.timeZoneAbbrev}, UTC${moment.tz(record.timeZoneID).utcOffset()})`}
      description={`Effective at ${getCleanISOString(record.activeDate)}`}
      onLongPress={() => Clipboard.setString(record.timeZoneID)}
    />
  );
};

export const MainTimeZoneScreen = () => {
  return (
    <PreRegistrationScreen>
      <TimeZoneScreen />
    </PreRegistrationScreen>
  );
};

const TimeZoneScreen = () => {
  const {data, refetch, isFetching, isInitialLoading} = useTimeZoneChangesQuery();
  const navigation = useCommonStack();
  const {data: notificationData, refetch: refetchNotificationData} = useUserNotificationDataQuery();

  const refresh = async () => {
    await Promise.all([refetch(), refetchNotificationData()]);
  };

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.timeZoneHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavBarIcons,
    });
  }, [getNavBarIcons, navigation]);

  if (isInitialLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refresh} />}>
        <ListSection>
          <ListSubheader>Device Time</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Text>
            You can compare your device time to the server with the button below. Remember that if there is a
            discrepancy between the ship clocks and Twitarr, the ship clocks are always right and Twitarr is wrong.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Check Device Time'}
            onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/time`)}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Time Zone Changes</ListSubheader>
        </ListSection>
        {data?.records.map((record, index) => {
          return <TimeZoneListItem key={index} record={record} />;
        })}
        {notificationData && (
          <View>
            <ListSection>
              <ListSubheader>Server Time Information</ListSubheader>
            </ListSection>
            <DataFieldListItem title={'Time'} description={notificationData.serverTime} />
            <DataFieldListItem title={'Time Zone ID'} description={notificationData.serverTimeZoneID} />
            <DataFieldListItem title={'Time Zone Abbreviation'} description={notificationData.serverTimeZone} />
            <DataFieldListItem title={'UTC Offset'} description={notificationData.serverTimeOffset / 60} />
          </View>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
