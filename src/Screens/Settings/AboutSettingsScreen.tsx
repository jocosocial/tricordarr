import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import {isAndroid} from '#src/Libraries/Platform/Detection';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
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
          <DataFieldListItem title={'App Name'} description={DeviceInfo.getApplicationName()} />
          <DataFieldListItem title={'App Version'} description={DeviceInfo.getVersion()} />
          <DataFieldListItem title={'Build'} description={DeviceInfo.getBuildNumber()} />
          <ListSubheader>Your Device</ListSubheader>
          <DataFieldListItem title={'System Version'} description={DeviceInfo.getSystemVersion()} />
          {isAndroid && <DataFieldListItem title={'API Level'} description={apiLevel?.toString()} />}
          <DataFieldListItem title={'Device ID'} description={DeviceInfo.getDeviceId()} />
          <DataFieldListItem title={'Manufacturer'} description={manufacturer} />
        </View>
      </ScrollView>
    </AppView>
  );
};
