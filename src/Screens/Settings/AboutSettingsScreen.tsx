import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {isAndroid} from '#src/Libraries/Platform/Detection';

export const AboutSettingsScreen = () => {
  const [apiLevel, setApiLevel] = useState<number>();
  const [manufacturer, setManufacturer] = useState('');
  const [pressCount, setPressCount] = useState(0);
  const {setSnackbarPayload} = useSnackbar();

  const handleBuildPress = () => {
    // Needs to be separate var because the state hasn't updated in time.
    const newPressCount = pressCount + 1;
    setPressCount(newPressCount);
    if (newPressCount % 5 === 0) {
      setSnackbarPayload({
        message:
          'Well look at you being all sneaky. Right idea but wrong component. The developer toggle is hidden elsewhere. Good hunting!',
        messageType: 'secret',
      });
    }
  };

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
          <DataFieldListItem title={'App Version'} description={DeviceInfo.getVersion()} onPress={handleBuildPress} />
          <DataFieldListItem title={'Build'} description={DeviceInfo.getBuildNumber()} onPress={handleBuildPress} />
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
