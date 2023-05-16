import {LinkingOptions} from '@react-navigation/native';
import {SeamailStackScreenComponents} from './Enums/Navigation';

const deepLinksConf = {
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
      screens: {
        SettingsTab: 'settingstab',
        ServerConnectionSettingsScreen: 'settingstab/serverconnectionsettingsscreen',
      },
    },
  },
};

export const navigationLinking: LinkingOptions<any> = {
  prefixes: ['tricordarr://'],
  config: deepLinksConf,
};
