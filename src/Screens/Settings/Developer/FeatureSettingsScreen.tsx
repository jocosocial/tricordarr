import React, {useState} from 'react';
import {RefreshControl} from 'react-native';
import {DataTable, Text} from 'react-native-paper';
import {AppView} from '#src/Components/Views/AppView';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

export const FeatureSettingsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {data: userNotificationData, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {disabledFeatures} = useFeature();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchUserNotificationData();
    setRefreshing(false);
  };

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text>Notification Data</Text>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Client</DataTable.Title>
              <DataTable.Title>Feature</DataTable.Title>
            </DataTable.Header>
            {userNotificationData?.disabledFeatures.map((feature, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{feature.appName}</DataTable.Cell>
                <DataTable.Cell>{feature.featureName}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </PaddedContentView>
        <PaddedContentView>
          <Text>Internal State</Text>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Feature</DataTable.Title>
            </DataTable.Header>
            {disabledFeatures.map((f, i) => {
              return (
                <DataTable.Row key={i}>
                  <DataTable.Cell>{f}</DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </DataTable>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
