import {Button, SafeAreaView, ScrollView, StatusBar, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import React, {useEffect} from 'react';
import {
  checkNotificationPermission,
  enableNotifications,
  startForegroundService,
  stopForegroundService,
} from '../../notifications';
import {Section} from '../Section';
import {requestPermission} from '../../libraries/Permissions';
import {displayTestNotification, cancelTestNotification} from '../../notifications/TestNotification';

export const ExampleAppView = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';

  // useEffect(() => {
  checkNotificationPermission().then();
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
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
