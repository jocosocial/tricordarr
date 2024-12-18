import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';
import {useTimeZoneChangesQuery} from '../../Queries/Admin/TimeZoneQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {RefreshControl, Linking, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {TimeZoneChangeRecord} from '../../../libraries/Structs/ControllerStructs.tsx';
import {DataTable, Text} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

const getCleanISOString = (dateString: string): string => {
  return new Date(dateString).toISOString().split('.')[0] + 'Z';
};

const TimeZoneListItem = ({record}: {record: TimeZoneChangeRecord}) => {
  const [showID, setShowID] = useState(false);
  return (
    <DataTable.Row>
      <DataTable.Cell onLongPress={() => Clipboard.setString(record.activeDate)}>
        {getCleanISOString(record.activeDate)}
      </DataTable.Cell>
      <DataTable.Cell onPress={() => setShowID(!showID)} onLongPress={() => Clipboard.setString(record.timeZoneID)}>
        {showID ? record.timeZoneID : record.timeZoneAbbrev}
      </DataTable.Cell>
    </DataTable.Row>
  );
};

export const MainTimeZoneScreen = () => {
  const {data, refetch, isFetching, isInitialLoading} = useTimeZoneChangesQuery();
  const navigation = useCommonStack();

  const getNavBarIcons = useCallback(
    () => (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.timeZoneHelpScreen)}
          />
        </HeaderButtons>
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
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <ListTitleView title={'Check Device Time'} />
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
        <ListTitleView title={'Time Zone Changes'} />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Effective Date (UTC)</DataTable.Title>
            <DataTable.Title>Time Zone (tap for ID)</DataTable.Title>
          </DataTable.Header>
          {data?.records.map((record, index) => {
            return <TimeZoneListItem key={index} record={record} />;
          })}
        </DataTable>
      </ScrollingContentView>
    </AppView>
  );
};
