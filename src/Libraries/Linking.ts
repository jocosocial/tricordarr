import type {PathConfig, PathConfigMap} from '@react-navigation/core';
import {LinkingOptions} from '@react-navigation/native';

import {getPath} from '#src/Libraries/RouteDefinitions';
import {appLinkPrefix, universalLinkHosts} from '#src/Libraries/UrlParser';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {OobeStackComponents} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {RootStackComponents, RootStackParamList} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {ScheduleStackParamList} from '#src/Navigation/Stacks/Schedule/ScheduleStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

type DeepLinksConfig<ParamList extends {}> = {
  initialRouteName?: keyof ParamList;
  screens: PathConfigMap<ParamList>;
};

// Workaround for React Navigation's PathConfigMap inference limitation.
// TypeScript cannot reverse-infer nested ParamList from NavigatorScreenParams,
// so we explicitly provide it via the generic parameter.
const tabLinkConfig = <T extends {}>(config: PathConfig<T>): any => config;

/**
 * Restrict a route's params to UUIDs. The web UI has pages like `/forum/search` and
 * `/seamail/create` beside its `:id` routes. Without this they would open the native screen with
 * the word as its ID, instead of falling through to SiteUILinkScreen.
 */
const uuidPath = (path: string): string => path.replace(/:(\w+)/g, ':$1([0-9a-fA-F-]{36})');

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
    OobeStackNavigator: {
      screens: {
        OobeWelcomeScreen: getPath(OobeStackComponents.oobeWelcomeScreen),
      },
    },
    RootContentScreen: {
      screens: {
        HomeTab: tabLinkConfig<MainStackParamList>({
          initialRouteName: MainStackComponents.mainScreen,
          screens: {
            MainScreen: getPath(MainStackComponents.mainScreen),
            HelpIndexScreen: getPath(CommonStackComponents.helpIndexScreen),
            AdminScreen: getPath(CommonStackComponents.adminScreen),
            EventFeedbackSelectScreen: getPath(CommonStackComponents.eventFeedbackSelectScreen),
            EventFeedbackFormScreen: getPath(CommonStackComponents.eventFeedbackFormScreen),
            AboutTricordarrScreen: getPath(CommonStackComponents.aboutTricordarrScreen),
            AboutTwitarrScreen: getPath(CommonStackComponents.aboutTwitarrScreen),
            PrivacyScreen: getPath(CommonStackComponents.privacyScreen),
            FaqScreen: getPath(MainStackComponents.faqScreen),
            SiteUIScreen: getPath(CommonStackComponents.siteUIScreen),
            SiteUILinkScreen: '*', // Catch-all wildcard - special case, not in RouteDefinitions
            MainSettingsScreen: {
              screens: {
                SettingsScreen: getPath(SettingsStackScreenComponents.settings),
                PushNotificationSettingsScreen: getPath(SettingsStackScreenComponents.pushNotificationSettings),
                BackgroundConnectionSettingsScreen: getPath(SettingsStackScreenComponents.backgroundConnectionSettings),
                LoginScreen: getPath(SettingsStackScreenComponents.login),
              },
            },
            UserProfileScreen: uuidPath(getPath(CommonStackComponents.userProfileScreen)),
            UserSelfProfileScreen: getPath(CommonStackComponents.userSelfProfileScreen),
            UsernameProfileScreen: getPath(CommonStackComponents.usernameProfileScreen),
            UsersListScreen: getPath(CommonStackComponents.usersList),
            MapScreen: getPath(CommonStackComponents.mapScreen),
            // The web UI calls this page /directory.
            UserDirectoryScreen: {
              path: getPath(MainStackComponents.userDirectoryScreen),
              alias: ['directory'],
            },
            MainConductScreen: getPath(MainStackComponents.conductScreen),
            DailyThemesScreen: getPath(CommonStackComponents.dailyThemesScreen),
            PhotostreamScreen: getPath(MainStackComponents.photostreamScreen),
            MicroKaraokeListScreen: getPath(MainStackComponents.microKaraokeListScreen),
            PerformerListScreen: getPath(MainStackComponents.performerListScreen),
            PerformerSelfScreen: getPath(CommonStackComponents.performerSelfScreen),
            PerformerScreen: uuidPath(getPath(CommonStackComponents.performerScreen)),
            MainTimeZoneScreen: getPath(CommonStackComponents.mainTimeZoneScreen),
            BoardgameListScreen: getPath(MainStackComponents.boardgameListScreen),
            HuntListScreen: getPath(MainStackComponents.huntListScreen),
            HuntScreen: uuidPath(getPath(CommonStackComponents.huntScreen)),
            HuntPuzzleScreen: uuidPath(getPath(CommonStackComponents.huntPuzzleScreen)),
            KaraokePerformanceListScreen: getPath(MainStackComponents.karaokePerformanceListScreen),
            KaraokeSearchScreen: getPath(MainStackComponents.karaokeSearchScreen),
            KaraokeFavoritesListScreen: getPath(MainStackComponents.karaokeFavoritesListScreen),
            KaraokeLogPerformanceScreen: getPath(MainStackComponents.karaokeLogPerformanceScreen),
            ModeratorHomeScreen: getPath(CommonStackComponents.moderatorHomeScreen),
            ModeratorReportsScreen: {
              path: 'reports/:closed?',
              parse: {
                closed: (value?: string) => value === 'closed' || value === 'true',
              },
              stringify: {
                closed: (value?: boolean) => (value ? 'closed' : undefined) as string,
              },
            },
            ModeratorLogScreen: getPath(CommonStackComponents.moderatorLogScreen),
            ModeratorGuideScreen: getPath(CommonStackComponents.moderatorGuideScreen),
            ModerateForumPostScreen: getPath(CommonStackComponents.moderateForumPostScreen),
            ModerateForumThreadScreen: getPath(CommonStackComponents.moderateForumThreadScreen),
            ModerateLfgScreen: getPath(CommonStackComponents.moderateLfgScreen),
            ModerateFezPostScreen: getPath(CommonStackComponents.moderateFezPostScreen),
            ModerateProfileScreen: getPath(CommonStackComponents.moderateProfileScreen),
            ModerateUserScreen: getPath(CommonStackComponents.moderateUserScreen),
            ModeratePhotostreamScreen: getPath(CommonStackComponents.moderatePhotostreamScreen),
            ModeratePrivateEventScreen: getPath(CommonStackComponents.moderatePrivateEventScreen),
            ModerateMicroKaraokeSongsScreen: getPath(CommonStackComponents.moderateMicroKaraokeSongsScreen),
            ModerateMicroKaraokeSongScreen: getPath(CommonStackComponents.moderateMicroKaraokeSongScreen),
          },
        }),
        SeamailTab: tabLinkConfig<ChatStackParamList>({
          initialRouteName: ChatStackScreenComponents.seamailListScreen,
          screens: {
            SeamailListScreen: getPath(ChatStackScreenComponents.seamailListScreen),
            SeamailChatScreen: uuidPath(getPath(CommonStackComponents.seamailChatScreen)),
            PrivateEventChatScreen: uuidPath(getPath(CommonStackComponents.privateEventChatScreen)),
            KrakenTalkReceiveScreen: getPath(ChatStackScreenComponents.krakenTalkReceiveScreen),
          },
        }),
        LfgTab: tabLinkConfig<LfgStackParamList>({
          initialRouteName: LfgStackComponents.lfgListScreen,
          screens: {
            LfgListScreen: {
              path: 'lfg/:endpoint(open|joined|owner|former)?',
              parse: {
                endpoint: (value?: string) => {
                  // Default to 'open' when no endpoint in URL
                  if (!value || value === '') return 'open';
                  return value;
                },
              },
              stringify: {
                endpoint: (value: string) => {
                  // /lfg maps to 'open', others include endpoint in URL
                  return (value === 'open' ? undefined : value) as string;
                },
              },
            },
            LfgScreen: uuidPath(getPath(CommonStackComponents.lfgScreen)),
            LfgChatScreen: uuidPath(getPath(CommonStackComponents.lfgChatScreen)),
            LfgHelpScreen: getPath(CommonStackComponents.lfgHelpScreen),
          },
        }),
        ScheduleTab: tabLinkConfig<ScheduleStackParamList>({
          initialRouteName: CommonStackComponents.scheduleDayScreen,
          screens: {
            ScheduleDayScreen: getPath(CommonStackComponents.scheduleDayScreen),
            EventScreen: uuidPath(getPath(CommonStackComponents.eventScreen)),
            PersonalEventScreen: uuidPath(getPath(CommonStackComponents.personalEventScreen)),
          },
        }),
        ForumsTab: tabLinkConfig<ForumStackParamList>({
          initialRouteName: ForumStackComponents.forumCategoriesScreen,
          screens: {
            ForumCategoriesScreen: getPath(ForumStackComponents.forumCategoriesScreen),
            ForumCategoryScreen: uuidPath(getPath(ForumStackComponents.forumCategoryScreen)),
            ForumPostMentionScreen: getPath(ForumStackComponents.forumPostMentionScreen),
            ForumThreadScreen: uuidPath(getPath(CommonStackComponents.forumThreadScreen)),
            ForumThreadPostScreen: getPath(CommonStackComponents.forumThreadPostScreen),
          },
        }),
      },
    },
    LighterScreen: getPath(RootStackComponents.lighterScreen),
  },
};

/**
 * This is the actual Linking object that we export and include in App.tsx.
 * https://developer.android.com/training/app-links
 * NavigationProvider extends `filter` with the checks that depend on the session.
 */
export const navigationLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [appLinkPrefix, ...universalLinkHosts.map(host => `https://${host}`)],
  filter: url => !url.includes('expo-development-client'),
  config: deepLinksConf,
};
