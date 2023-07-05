import React from 'react';
import {View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {commonStyles} from '../../../styles';
import {PaddedContentView} from '../Content/PaddedContentView';
import {List} from 'react-native-paper';
import {AppIcon} from '../../Images/AppIcon';
import {ListSection} from '../../Lists/ListSection';
import {useBottomTabNavigator} from '../../Navigation/Tabs/BottomTabNavigator';
import {
  BottomTabComponents,
  MainStackComponents,
  SettingsStackScreenComponents,
} from '../../../libraries/Enums/Navigation';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useMainStack} from '../../Navigation/Stacks/MainStack';
import {HeaderBackButton} from '@react-navigation/elements';
import {MainNavigationListItem} from '../../Lists/Items/MainNavigationListItem';

export const MainView = () => {
  const bottomNav = useBottomTabNavigator();
  // const mainNav = useMainStack();

  function getIconButton(icon: string) {
    return <IconButton icon={icon} />;
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <ListSection>
            <List.Subheader>Communication</List.Subheader>
            <MainNavigationListItem
              title={'Forums'}
              description={'A place to talk'}
              onPress={() => console.log('forums')}
              icon={AppIcons.forum}
            />
            <MainNavigationListItem
              title={'Seamail'}
              description={'Private direct messages.'}
              onPress={() => console.log('chat')}
              icon={AppIcons.seamail}
            />
            <MainNavigationListItem
              title={'KrakenTalk'}
              description={'On-board Wi-Fi calling.'}
              onPress={() => console.log('kraken')}
              icon={AppIcons.krakentalk}
            />
          </ListSection>
          <ListSection>
            <List.Subheader>Events</List.Subheader>
            <MainNavigationListItem
              title={'Schedule'}
              description={'Official and Shadow calendar.'}
              onPress={() => console.log('events')}
              icon={AppIcons.events}
            />
            <MainNavigationListItem
              title={'Looking For Group (LFG)'}
              description={'Attendee events and gatherings.'}
              onPress={() => console.log('LFG')}
              icon={AppIcons.group}
            />
          </ListSection>
          <ListSection>
            <List.Subheader>Other</List.Subheader>
            <MainNavigationListItem
              title={'Karaoke'}
              description={'Maps of the ship.'}
              onPress={() => console.log('karaoke')}
              icon={AppIcons.webview}
            />
            <MainNavigationListItem
              title={'Games'}
              description={'Games?'}
              onPress={() => console.log('games!')}
              icon={AppIcons.webview}
            />
            <MainNavigationListItem
              title={'Lighter'}
              description={'Concert.'}
              onPress={() => console.log('lighter')}
              icon={AppIcons.webview}
            />
            <MainNavigationListItem
              title={'Twitarr Web UI'}
              description={'Built-in Twitarr website access.'}
              onPress={() =>
                bottomNav.navigate(BottomTabComponents.homeTab, {
                  screen: MainStackComponents.siteUIScreen,
                })
              }
              icon={AppIcons.webview}
            />
            <MainNavigationListItem
              title={'Settings'}
              description={'App preferences and configuration.'}
              onPress={() =>
                bottomNav.navigate(BottomTabComponents.settingsTab, {
                  screen: SettingsStackScreenComponents.settings,
                })
              }
              icon={AppIcons.settings}
            />
          </ListSection>
          <ListSection>
            <List.Subheader>Help & Information</List.Subheader>
            <MainNavigationListItem
              title={'Deck Maps'}
              description={'Maps of the ship.'}
              onPress={() => console.log('map')}
              icon={AppIcons.webview}
            />
            <MainNavigationListItem
              title={'About Twitarr'}
              description={'Our bespoke social media service.'}
              onPress={() => console.log('twitarr')}
              icon={AppIcons.webview}
            />
            <MainNavigationListItem
              title={'About Tricordarr'}
              description={'This Android app.'}
              onPress={() => console.log('app')}
              icon={AppIcons.webview}
            />
          </ListSection>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'displayMedium'}>Hello Boat!</Text>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            ⚠️ Warning ⚠️
          </Text>
          <Text>This app is an extremely experimental prototype and should be treated as such.</Text>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Features that [should] work:
          </Text>
          <View>
            <Text>{'\u2022 Push notifications for Seamail/Chat.'}</Text>
            <Text>{'\u2022 Notifications open content within the app.'}</Text>
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
            <Text>
              1. Go into the Settings menu and tap Login and enter your Twitarr credentials. You must already have an
              account created.
            </Text>
            <Text>
              2. You should see a notification generate 10 seconds later titled Twitarr Server Connection. By Android
              Law(tm) I am required to show this to you. As of Android 13 you can dismiss it and the worker will keep
              running.
            </Text>
            <Text>3. Go to the Twit-arr tab, and log in there, too.</Text>
          </View>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Troubleshooting:
          </Text>
          <View>
            <Text>{'\u2022 Double check the Server URL (Settings).'}</Text>
            <Text>
              {'\u2022 In the Server Connection settings, if you dont see "open" try stop/start the FGS service.'}
            </Text>
            <Text>{'\u2022 Close the app (dismiss from background too) and relaunch.'}</Text>
            <Text>{'\u2022 You may need to adjust the apps battery usage to unrestricted.'}</Text>
            <Text>{'\u2022 Post on Twitarr via the website and maybe someone can help.'}</Text>
          </View>
          <Text variant={'titleLarge'} style={commonStyles.marginTop}>
            Credits:
          </Text>
          <Text>
            Grant Cohoe (@grant) built this app with contributions from Dustin Hendrickson (@hendu) and support from the
            rest of the Twitarr team and viewers like you. Thank you!
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
