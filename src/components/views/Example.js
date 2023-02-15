import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import React from 'react';
import notifee from '@notifee/react-native';
import {cancel, doForegroundThingy} from '../../notifications';
import {Section} from '../Section';

export const ExampleAppView = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  async function onDisplayNotification() {
    // Create a channel
    const channelId = await notifee.createChannel({
      id: 'seamail',
      name: 'Seamail',
    });

    // Display a notification
    await notifee.displayNotification({
      id: 'abc123',
      title: 'Jonathan Coulton',
      body: "This was a triumph. I'm making a note here: HUGE SUCCESS. It's hard to overstate my satisfaction.",
      android: {
        channelId,
        // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        autoCancel: false,
        // https://notifee.app/react-native/docs/android/interaction
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            OH HERRO
            {'\n'}
            <Button
              title="Display Notification???"
              onPress={() => onDisplayNotification()}
            />
            {'\n'}
            <Button
              title="Cancel"
              onPress={() => {
                console.log('CANCELING AT return::onPress');
                cancel('abc123');
              }}
            />
          </Section>
          <Section title="Foreground Service">
            <Button
              title={'Start'}
              onPress={() => {
                console.log('START THE FORETHINGY');
                doForegroundThingy();
              }}
            />
            <Button
              color={'red'}
              title={'Stop'}
              onPress={() => {
                console.log('STOPPING THE FORETHINGY');
                notifee.stopForegroundService();
              }}
            />
          </Section>
          <Section title="Navigation">
            <Button
              color={'green'}
              title={'Login'}
              onPress={() => navigation.navigate('Login')}
            />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};