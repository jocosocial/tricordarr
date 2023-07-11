import {LinkingOptions} from '@react-navigation/native';
import {SeamailStackScreenComponents, SettingsStackScreenComponents} from './Enums/Navigation';
import {RootStackParamList} from '../components/Navigation/Stacks/RootStackNavigator';

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
            AboutScreen: 'about',
            SiteUIScreen: 'twitarrtab/:timestamp?/:resource?/:id?',
            MainSettingsScreen: {
              initialRouteName: SettingsStackScreenComponents.settings,
              screens: {
                SettingsTab: 'settingstab',
                ServerConnectionSettingsScreen: 'settingstab/serverconnectionsettingsscreen',
              },
            },
          },
        },
        SeamailTab: {
          initialRouteName: SeamailStackScreenComponents.seamailListScreen,
          screens: {
            SeamailTab: 'seamail',
            SeamailScreen: 'seamail/:fezID',
          },
        },
      },
    },
  },
};

/**
 * This is the actual Linking object that we export and include in App.tsx.
 */
export const navigationLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['tricordarr://'],
  config: deepLinksConf,
};
