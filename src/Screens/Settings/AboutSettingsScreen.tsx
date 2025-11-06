import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import {ListItem} from '#src/Components/Lists/ListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';

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
          <ListSubheader>This App</ListSubheader>
          <ListItem title={'App Name'} description={DeviceInfo.getApplicationName()} />
          <ListItem title={'App Version'} description={DeviceInfo.getVersion()} />
          <ListItem title={'Build'} description={DeviceInfo.getBuildNumber()} />
          <ListSubheader>Your Device</ListSubheader>
          <ListItem title={'System Version'} description={DeviceInfo.getSystemVersion()} />
          {Platform.OS === 'android' && <ListItem title={'API Level'} description={apiLevel?.toString()} />}
          <ListItem title={'Device ID'} description={DeviceInfo.getDeviceId()} />
          <ListItem title={'Manufacturer'} description={manufacturer} />
        </View>
      </ScrollView>
    </AppView>
  );
};
