import {LinkingOptions} from '@react-navigation/native';
import {ScheduleStackComponents, SeamailStackScreenComponents, SettingsStackScreenComponents} from './Enums/Navigation';
import {RootStackParamList} from '../components/Navigation/Stacks/RootStackNavigator';
import Config from 'react-native-config';

/**
 * Route map of all routes necessary for deep linking. initialRouteName's should probably
 * be based on a StackScreenComponent enum value. The actual tabs will vary and should loosely
 * follow the routes that we use in the Swiftarr web UI.
 */
const deepLinksConf = {
  screens: {
    OobeWelcomeScreen: 'oobe',
    RootContentScreen: {
      screens: {
        HomeTab: {
          screens: {
            MainScreen: 'home',
            AboutScreen: 'about',
            SiteUIScreen: 'twitarrtab/:timestamp?/:resource?/:id?',
            MainSettingsScreen: {
              initialRouteName: SettingsStackScreenComponents.settings,
              screens: {
                SettingsTab: 'settingstab',
                ServerConnectionSettingsScreen: 'settingstab/serverconnectionsettingsscreen',
                LoginScreen: 'login',
              },
            },
            UserProfileScreen: 'user/:userID',
            UserDirectoryScreen: 'users',
          },
        },
        SeamailTab: {
          initialRouteName: SeamailStackScreenComponents.seamailListScreen,
          screens: {
            SeamailTab: 'seamail',
            SeamailScreen: 'seamail/:fezID',
          },
        },
        ScheduleTab: {
          initialRouteName: ScheduleStackComponents.scheduleDayScreen,
          screens: {
            LfgScreen: 'lfg/:fezID',
          },
        },
      },
    },
    LighterScreen: 'lighter',
  },
};

/**
 * This is the actual Linking object that we export and include in App.tsx.
 * https://developer.android.com/training/app-links
 * I've tried making App Links worked, but couldn't get it going. https://beta.twitarr.com
 * kept sending me to the browser. Maybe I have to go through the asset generation/verification?
 * idk...
 */
export const navigationLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['tricordarr://', Config.SERVER_URL].filter(prefix => prefix !== undefined) as string[],
  config: deepLinksConf,
};
