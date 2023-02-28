import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from './AppView';
import {AppContainerView} from './AppContainerView';
import {ScrollView, View} from 'react-native';
import {commonStyles} from '../../styles';

export const MainView = () => {
  return (
    <AppView>
      <AppContainerView>
        <ScrollView>
          <Text variant={'displayLarge'}>Hello Boat!</Text>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>⚠️ Warning ⚠️</Text>
          <Text>This app is an extremely experimental prototype and should be treated as such.</Text>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Features that [should] work:
          </Text>
          <View>
            <Text>{'\u2022 Push notifications for Seamail/Chat.'}</Text>
            <Text>{'\u2022 Periodic pull notifications for Seamail/Chat in app.'}</Text>
          </View>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Features that are missing:
          </Text>
          <View>
            <Text>{'\u2022 Literally everything else Twitarr does.'}</Text>
          </View>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Setup Instructions:
          </Text>
          <View>
            <Text>{'1. Go into the Settings menu and tap Login and enter your Twitarr credentials. You must already have an account created.'}</Text>
            <Text>2. You should see a notification generate 10 seconds later titled Twitarr Server Connection. By Android Law(tm) I am required to show this to you. As of Android 13 you can dismiss it and the worker will keep running.</Text>
          </View>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Troubleshooting:
          </Text>
          <View>
            <Text>{'\u2022 Double check the Server URL (Settings).'}</Text>
            <Text>{'\u2022 In the Server Connection settings, if you dont see "open" try stop/start the FGS service.'}</Text>
            <Text>{'\u2022 Close the app (dismiss from background too) and relaunch.'}</Text>
            <Text>{'\u2022 You may need to adjust the apps battery usage to unrestricted.'}</Text>
            <Text>{'\u2022 Post on Twitarr via the website and maybe someone can help.'}</Text>
          </View>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Credits:
          </Text>
          <Text>Grant Cohoe (@grant) built this app with contributions from Dustin Hendrickson (@hendusoone) and support from the rest of the Twitarr team and viewers like you. Thank you!</Text>
        </ScrollView>
      </AppContainerView>
    </AppView>
  );
};
