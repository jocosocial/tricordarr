import {Formik} from 'formik';
import React, {useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {DataTable, Text} from 'react-native-paper';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

export const FeatureSettingsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {data: userNotificationData, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {disabledFeatures} = useFeature();
  const {appConfig, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();
  const [enableExperiments, setEnableExperiments] = useState(appConfig.enableExperiments);

  const handleEnableExperiments = () => {
    const newValue = !appConfig.enableExperiments;
    updateAppConfig({
      ...appConfig,
      enableExperiments: newValue,
    });
    setEnableExperiments(newValue);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchUserNotificationData();
    setRefreshing(false);
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Experiments</ListSubheader>
          <PaddedContentView padSides={false}>
            <Formik initialValues={{}} onSubmit={() => {}}>
              <View>
                <BooleanField
                  name={'enableExperiments'}
                  label={'Enable Experiments'}
                  helperText={
                    'Enable experimental features in this app that are not yet ready for general consumption.'
                  }
                  value={enableExperiments}
                  onPress={handleEnableExperiments}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </View>
            </Formik>
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Server Features</ListSubheader>
          <PaddedContentView padTop={true}>
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
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
