import {Button, SafeAreaView, ScrollView, StatusBar, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import React, {useEffect} from 'react';
import {
  checkNotificationPermission,
  enableNotifications, setupBackgroundEventHandler,
  startForegroundService,
  stopForegroundService,
} from '../../notifications';
import {Section} from '../Section';
import {requestPermission} from '../../libraries/Permissions';
import {displayTestNotification, cancelTestNotification} from '../../notifications/TestNotification';
import {getCurrentSSID} from '../../libraries/Network';
import {Settings} from '../../libraries/Settings';
import {dumpStorageKeys} from '../../libraries/Storage';

export const MainView = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';

  // useEffect(() => {
  // }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  async function showSSID() {
    console.log('The current SSID is:', await getCurrentSSID());
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        {/*<Header />*/}
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            <Button title={'Enable Notifications'} onPress={() => enableNotifications()} />
            <Button color={'teal'} title={'Enable Perms'} onPress={() => requestPermission()} />
            <Button title="Display Notification" onPress={() => displayTestNotification()} />
            {'\n'}
            <Button title="Cancel" onPress={() => cancelTestNotification()} />
          </Section>
          <Section title="Foreground Service">
            <Button title={'Start'} onPress={() => startForegroundService().catch(console.error)} />
            <Button color={'red'} title={'Stop'} onPress={() => stopForegroundService().catch(console.error)} />
          </Section>
          <Section title="Navigation">
            <Button color={'green'} title={'Login'} onPress={() => navigation.navigate('Login')} />
            <Button color={'green'} title={'Settings'} onPress={() => navigation.navigate('Settings')} />
          </Section>
          <Section title={'Information'}>
            <Button title={'SSID'} onPress={() => showSSID()} />
            <Button title={'Server'} onPress={() => console.log(Settings.SERVER_URL)} />
            <Button title={'Storage Keys'} onPress={() => dumpStorageKeys()} />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
