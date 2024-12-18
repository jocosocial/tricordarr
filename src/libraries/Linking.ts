import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../components/Navigation/Stacks/RootStackNavigator';
import Config from 'react-native-config';
import type {PathConfigMap} from '@react-navigation/core';
import {MainStackComponents} from '../components/Navigation/Stacks/MainStackNavigator.tsx';
import {LfgStackComponents} from '../components/Navigation/Stacks/LFGStackNavigator.tsx';
import {ForumStackComponents} from '../components/Navigation/Stacks/ForumStackNavigator.tsx';
import {ScheduleStackComponents} from '../components/Navigation/Stacks/ScheduleStackNavigator.tsx';
import {ChatStackScreenComponents} from '../components/Navigation/Stacks/ChatStackNavigator.tsx';
import {LfgJoinedScreen} from '../components/Screens/LFG/LfgJoinedScreen.tsx';

type DeepLinksConfig<ParamList extends {}> = {
  initialRouteName?: keyof ParamList;
  screens: PathConfigMap<ParamList>;
};

/**
 * Route map of all routes necessary for deep linking. initialRouteName's should probably
 * be based on a StackScreenComponent enum value. The actual tabs will vary and should loosely
 * follow the routes that we use in the Swiftarr web UI.
 * The initialRouteName's cannot be undefined or you'll lose initial navigation on link.
 */
const deepLinksConf: DeepLinksConfig<RootStackParamList> = {
  screens: {
    OobeWelcomeScreen: 'oobe',
    RootContentScreen: {
      screens: {
        HomeTab: {
          initialRouteName: MainStackComponents.mainScreen,
          screens: {
            MainScreen: 'home',
            AboutScreen: 'about',
            SiteUIScreen: 'twitarrtab/:timestamp?/:resource?/:id?',
            // I wanted PersonalEventScreen: { paths: [one, two] } but it kept
            // falling through to the default route. This is what we do in the UI, so oh well.
            // Perhaps I should make a PR to Swiftarr to change that?
            PersonalEventScreen: 'privateevent/:eventID',
            SiteUILinkScreen: '*', // Catch-all wildcard
            MainSettingsScreen: {
              // Disable this to prevent doubling up on the SettingsScreen after going back.
              // initialRouteName: SettingsStackScreenComponents.settings,
              screens: {
                SettingsScreen: 'settings',
                ServerConnectionSettingsScreen: 'settings/serverconnectionsettingsscreen',
                PushNotificationSettingsScreen: 'settings/pushnotifications',
                LoginScreen: 'login',
              },
            },
            UserProfileScreen: 'user/:userID',
            UsernameProfileScreen: 'username/:username',
            UserDirectoryScreen: 'users',
            MapScreen: 'map/:deckNumber?',
            MainConductScreen: 'codeOfConduct',
            DailyThemesScreen: 'dailyThemes',
            PhotostreamScreen: 'photostream',
            MicroKaraokeListScreen: 'microkaraoke',
            PerformerListScreen: 'performers',
            MainTimeZoneScreen: 'time',
          },
        },
        SeamailTab: {
          initialRouteName: ChatStackScreenComponents.seamailListScreen,
          screens: {
            SeamailTab: 'seamail',
            SeamailChatScreen: 'seamail/:fezID',
            KrakenTalkReceiveScreen: 'phonecall/:callID/from/:callerUserID/:callerUsername',
          },
        },
        LfgTab: {
          initialRouteName: LfgStackComponents.lfgFindScreen,
          screens: {
            LfgTab: 'lfg',
            LfgScreen: 'lfg/:fezID',
            LfgChatScreen: 'lfg/:fezID/chat',
            LfgHelpScreen: 'lfg/faq',
            LfgJoinedScreen: 'lfg/joined',
          },
        },
        ScheduleTab: {
          initialRouteName: ScheduleStackComponents.scheduleDayScreen,
          screens: {
            ScheduleDayScreen: 'events',
            EventScreen: 'events/:eventID',
          },
        },
        ForumsTab: {
          initialRouteName: ForumStackComponents.forumCategoriesScreen,
          screens: {
            ForumCategoriesScreen: 'forums',
            ForumCategoryScreen: 'forums/:categoryID',
            ForumThreadScreen: 'forum/:forumID',
            ForumThreadPostScreen: 'forum/containingpost/:postID',
            ForumPostMentionScreen: 'forumpost/mentions',
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
