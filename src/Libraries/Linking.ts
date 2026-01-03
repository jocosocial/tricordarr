import type {PathConfigMap} from '@react-navigation/core';
import {LinkingOptions} from '@react-navigation/native';

import {getPath} from '#src/Libraries/RouteDefinitions';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {ForumStackComponents} from '#src/Navigation/Stacks/ForumStackNavigator';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator';
import {OobeStackComponents} from '#src/Navigation/Stacks/OobeStackNavigator';
import {RootStackComponents, RootStackParamList} from '#src/Navigation/Stacks/RootStackNavigator';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

type DeepLinksConfig<ParamList extends {}> = {
  initialRouteName?: keyof ParamList;
  screens: PathConfigMap<ParamList>;
};

/**
 * Route map of all routes necessary for deep linking. initialRouteName's should probably
 * be based on a StackScreenComponent enum value. The actual tabs will vary and should loosely
 * follow the routes that we use in the Swiftarr web UI.
 * The initialRouteName's cannot be undefined or you'll lose initial navigation on link.
 *
 * All paths are sourced from RouteDefinitions.ts via getPath() to ensure consistency.
 */
const deepLinksConf: DeepLinksConfig<RootStackParamList> = {
  screens: {
    OobeWelcomeScreen: getPath(OobeStackComponents.oobeWelcomeScreen),
    RootContentScreen: {
      screens: {
        HomeTab: {
          initialRouteName: MainStackComponents.mainScreen,
          screens: {
            MainScreen: getPath(MainStackComponents.mainScreen),
            HelpIndexScreen: getPath(CommonStackComponents.helpIndexScreen),
            AboutTricordarrScreen: getPath(CommonStackComponents.aboutTricordarrScreen),
            AboutTwitarrScreen: getPath(CommonStackComponents.aboutTwitarrScreen),
            FaqScreen: getPath(MainStackComponents.faqScreen),
            SiteUIScreen: getPath(CommonStackComponents.siteUIScreen),
            SiteUILinkScreen: '*', // Catch-all wildcard - special case, not in RouteDefinitions
            MainSettingsScreen: {
              screens: {
                SettingsScreen: getPath(SettingsStackScreenComponents.settings),
                ServerConnectionSettingsScreen: getPath(SettingsStackScreenComponents.networkInfoSettings),
                PushNotificationSettingsScreen: getPath(SettingsStackScreenComponents.pushNotificationSettings),
                LoginScreen: getPath(SettingsStackScreenComponents.login),
              },
            },
            UserProfileScreen: getPath(CommonStackComponents.userProfileScreen),
            UsernameProfileScreen: getPath(CommonStackComponents.usernameProfileScreen),
            FavoriteUsersScreen: getPath(CommonStackComponents.favoriteUsers),
            MapScreen: getPath(CommonStackComponents.mapScreen),
            UserDirectoryScreen: getPath(MainStackComponents.userDirectoryScreen),
            MainConductScreen: getPath(MainStackComponents.conductScreen),
            DailyThemesScreen: getPath(MainStackComponents.dailyThemesScreen),
            PhotostreamScreen: getPath(MainStackComponents.photostreamScreen),
            MicroKaraokeListScreen: getPath(MainStackComponents.microKaraokeListScreen),
            PerformerListScreen: getPath(MainStackComponents.performerListScreen),
            MainTimeZoneScreen: getPath(CommonStackComponents.mainTimeZoneScreen),
            BoardgameListScreen: getPath(MainStackComponents.boardgameListScreen),
          },
        },
        SeamailTab: {
          initialRouteName: ChatStackScreenComponents.seamailListScreen,
          screens: {
            SeamailListScreen: getPath(ChatStackScreenComponents.seamailListScreen),
            SeamailChatScreen: getPath(CommonStackComponents.seamailChatScreen),
            KrakenTalkReceiveScreen: getPath(ChatStackScreenComponents.krakenTalkReceiveScreen),
          },
        },
        LfgTab: {
          initialRouteName: LfgStackComponents.lfgFindScreen,
          screens: {
            LfgTab: getPath(LfgStackComponents.lfgFindScreen),
            LfgScreen: getPath(CommonStackComponents.lfgScreen),
            LfgChatScreen: getPath(CommonStackComponents.lfgChatScreen),
            LfgHelpScreen: getPath(CommonStackComponents.lfgHelpScreen),
            LfgJoinedScreen: getPath(LfgStackComponents.lfgJoinedScreen),
          },
        },
        ScheduleTab: {
          initialRouteName: CommonStackComponents.scheduleDayScreen,
          screens: {
            ScheduleDayScreen: getPath(CommonStackComponents.scheduleDayScreen),
            EventScreen: getPath(CommonStackComponents.eventScreen),
            PersonalEventScreen: getPath(CommonStackComponents.personalEventScreen),
            SchedulePrivateEventsScreen: getPath(CommonStackComponents.schedulePrivateEventsScreen),
          },
        },
        ForumsTab: {
          initialRouteName: ForumStackComponents.forumCategoriesScreen,
          screens: {
            ForumCategoriesScreen: getPath(ForumStackComponents.forumCategoriesScreen),
            ForumCategoryScreen: getPath(ForumStackComponents.forumCategoryScreen),
            ForumPostMentionScreen: getPath(ForumStackComponents.forumPostMentionScreen),
            ForumThreadScreen: getPath(CommonStackComponents.forumThreadScreen),
            ForumThreadPostScreen: getPath(CommonStackComponents.forumThreadPostScreen),
          },
        },
      },
    },
    LighterScreen: getPath(RootStackComponents.lighterScreen),
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
  prefixes: ['tricordarr://'].filter(prefix => prefix !== undefined) as string[],
  config: deepLinksConf,
};
