import {LinkingOptions} from '@react-navigation/native';
import {BottomTabComponents, SeamailStackScreenComponents, SettingsStackScreenComponents} from './Enums/Navigation';
import {BottomTabParamList} from '../components/Navigation/Tabs/BottomTabNavigator';

/**
 * Route map of all routes necessary for deep linking. initialRouteName's should probably
 * be based on a StackScreenComponent enum value. The actual tabs will vary and should loosely
 * follow the routes that we use in the Swiftarr web UI.
 */
const deepLinksConf = {
  initialRouteName: BottomTabComponents.homeTab,
  screens: {
    HomeTab: 'hometab',
    SeamailTab: {
      initialRouteName: SeamailStackScreenComponents.seamailListScreen,
      screens: {
        SeamailTab: 'seamail',
        SeamailScreen: 'seamail/:fezID',
      },
    },
    TwitarrTab: 'twitarrtab/:timestamp?/:resource?/:id?',
    SettingsTab: {
      initialRouteName: SettingsStackScreenComponents.settings,
      screens: {
        SettingsTab: 'settingstab',
        ServerConnectionSettingsScreen: 'settingstab/serverconnectionsettingsscreen',
      },
    },
  },
};

/**
 * This is the actual Linking object that we export and include in App.tsx.
 */
export const navigationLinking: LinkingOptions<BottomTabParamList> = {
  prefixes: ['tricordarr://'],
  config: deepLinksConf,
};
