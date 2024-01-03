import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {DataTable} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import {AppView} from '../../Views/AppView';

export const AboutSettingsScreen = () => {
  const [apiLevel, setApiLevel] = useState<number>();
  const [manufacturer, setManufacturer] = useState('');

  useEffect(() => {
    DeviceInfo.getApiLevel().then(value => {
      setApiLevel(value);
    });
    DeviceInfo.getManufacturer().then(value => {
      setManufacturer(value);
    });
  }, []);

  return (
    <AppView>
      <ScrollView>
        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>This App</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>App Name</DataTable.Cell>
              <DataTable.Cell>{DeviceInfo.getApplicationName()}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>App Version</DataTable.Cell>
              <DataTable.Cell>{DeviceInfo.getVersion()}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Build</DataTable.Cell>
              <DataTable.Cell>{DeviceInfo.getBuildNumber()}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Header>
              <DataTable.Title>Your Device</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>Android Version</DataTable.Cell>
              <DataTable.Cell>{DeviceInfo.getSystemVersion()}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>API Level</DataTable.Cell>
              <DataTable.Cell>{apiLevel}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Device ID</DataTable.Cell>
              <DataTable.Cell>{DeviceInfo.getDeviceId()}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Manufacturer</DataTable.Cell>
              <DataTable.Cell>{manufacturer}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
      </ScrollView>
    </AppView>
  );
};
