import {Button, SafeAreaView, ScrollView, StatusBar, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import React, {useEffect} from 'react';
import {Section} from '../Section';
import {requestNotificationPermission, requestPermission} from '../../libraries/AppPermissions';
import {displayTestNotification, cancelTestNotification} from '../../notifications/TestNotification';
import {getCurrentSSID} from '../../libraries/Network';
import {AppSettings} from '../../libraries/AppSettings';
import {dumpStorageKeys} from '../../libraries/Storage';
import NetInfo from "@react-native-community/netinfo";
import notifee, {AndroidColor} from "@notifee/react-native";
import {serviceChannel} from "../../notifications/Channels";
import {startForegroundServiceWorker, stopForegroundServiceWorker} from "../../libraries/Service";

export const MainView = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';

  // useEffect(() => {
  // }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

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
            <Button title={'Start'} onPress={() => startForegroundServiceWorker().catch(console.error)} />
            <Button color={'red'} title={'Stop'} onPress={() => stopForegroundServiceWorker().catch(console.error)} />
          </Section>
          <Section title="Navigation">
            <Button color={'green'} title={'Settings'} onPress={() => navigation.navigate('Settings')} />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
