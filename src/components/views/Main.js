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
import {requestNotificationPermission, requestPermission} from '../../libraries/AppPermissions';
import {displayTestNotification, cancelTestNotification} from '../../notifications/TestNotification';
import {getCurrentSSID} from '../../libraries/Network';
import {AppSettings} from '../../libraries/AppSettings';
import {dumpStorageKeys} from '../../libraries/Storage';
import NetInfo from "@react-native-community/netinfo";

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
            <Button title="Display Notification" onPress={() => displayTestNotification()} />
            {'\n'}
            <Button title="Cancel" onPress={() => cancelTestNotification()} />
          </Section>
          <Section title="Foreground Service">
            <Button title={'Start'} onPress={() => startForegroundService().catch(console.error)} />
            <Button color={'red'} title={'Stop'} onPress={() => stopForegroundService().catch(console.error)} />
          </Section>
          <Section title="Navigation">
            <Button color={'green'} title={'Settings'} onPress={() => navigation.navigate('Settings')} />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
