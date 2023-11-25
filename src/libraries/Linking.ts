import {LinkingOptions} from '@react-navigation/native';
import {
  EventStackComponents,
  LfgStackComponents, MainStackComponents,
  SeamailStackScreenComponents,
  SettingsStackScreenComponents
} from './Enums/Navigation';
import {RootStackParamList} from '../components/Navigation/Stacks/RootStackNavigator';
import Config from 'react-native-config';

/**
 * Route map of all routes necessary for deep linking. initialRouteName's should probably
 * be based on a StackScreenComponent enum value. The actual tabs will vary and should loosely
 * follow the routes that we use in the Swiftarr web UI.
 * I made the initialRouteName's undefined because the typing was yelling at me. I hope that
 * doesn't break anything.
 */
const deepLinksConf = {
  screens: {
    OobeWelcomeScreen: 'oobe',
    RootContentScreen: {
      screens: {
        HomeTab: {
          initialRouteName: undefined,
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
          initialRouteName: undefined,
          screens: {
            SeamailTab: 'seamail',
            SeamailScreen: 'seamail/:fezID',
          },
        },
        LfgTab: {
          initialRouteName: undefined,
          screens: {
            LfgTab: 'lfg',
            LfgScreen: 'lfg/:fezID',
            LfgChatScreen: 'lfg/:fezID/chat',
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
