import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {ForumStackComponents} from '#src/Navigation/Stacks/ForumStackNavigator';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator';
import {OobeStackComponents} from '#src/Navigation/Stacks/OobeStackNavigator';
import {RootStackComponents} from '#src/Navigation/Stacks/RootStackNavigator';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

/**
 * Unified route definition used for both deep linking config and URL parsing.
 */
export interface RouteDefinition {
  /** The screen component name (from stack component enums) */
  screen: string;
  /** The URL path pattern, e.g., 'forum/:forumID' */
  path: string;
}

/**
 * All routes in the app. Used as the single source of truth for path patterns.
 * Order matters for URL parsing - more specific routes should come first.
 */
export const allRoutes: RouteDefinition[] = [
  // ==================== Root Routes ====================
  {screen: OobeStackComponents.oobeWelcomeScreen, path: 'oobe'},
  {screen: RootStackComponents.lighterScreen, path: 'lighter'},

  // ==================== Home Tab Routes ====================
  {screen: MainStackComponents.mainScreen, path: 'home'},
  {screen: CommonStackComponents.helpIndexScreen, path: 'help'},
  {screen: CommonStackComponents.aboutTricordarrScreen, path: 'about-app'},
  {screen: CommonStackComponents.aboutTwitarrScreen, path: 'about'},
  {screen: CommonStackComponents.privacyScreen, path: 'privacy'},
  {screen: MainStackComponents.faqScreen, path: 'faq'},
  {screen: CommonStackComponents.siteUIScreen, path: 'twitarrtab/:timestamp?/:resource?/:id?/:action?'},
  {screen: MainStackComponents.userDirectoryScreen, path: 'users'},
  {screen: MainStackComponents.conductScreen, path: 'codeOfConduct'},
  {screen: MainStackComponents.dailyThemesScreen, path: 'dailyThemes'},
  {screen: MainStackComponents.photostreamScreen, path: 'photostream'},
  {screen: MainStackComponents.microKaraokeListScreen, path: 'microkaraoke'},
  {screen: MainStackComponents.karaokePerformanceListScreen, path: 'karaoke'},
  {screen: MainStackComponents.karaokeSearchScreen, path: 'karaoke/search'},
  {screen: MainStackComponents.karaokeFavoritesListScreen, path: 'karaoke/favorites'},
  {screen: MainStackComponents.karaokeLogPerformanceScreen, path: 'karaoke/log/:songID'},
  {screen: MainStackComponents.performerListScreen, path: 'performers'},
  {screen: CommonStackComponents.performerScreen, path: 'performer/:id'},
  {screen: CommonStackComponents.mainTimeZoneScreen, path: 'time'},
  {screen: MainStackComponents.boardgameListScreen, path: 'boardgames'},
  {screen: CommonStackComponents.userSelfProfileScreen, path: 'profile'},

  // ==================== Settings Routes ====================
  {screen: SettingsStackScreenComponents.settings, path: 'settings'},
  {screen: SettingsStackScreenComponents.pushNotificationSettings, path: 'settings/pushnotifications'},
  {screen: SettingsStackScreenComponents.login, path: 'login'},

  // ==================== User Routes ====================
  {screen: CommonStackComponents.userProfileScreen, path: 'user/:userID'},
  {screen: CommonStackComponents.usernameProfileScreen, path: 'username/:username'},
  {screen: CommonStackComponents.favoriteUsers, path: 'favorites'},
  {screen: CommonStackComponents.mapScreen, path: 'map/:deckNumber?'},

  // ==================== Seamail Tab Routes ====================
  {screen: ChatStackScreenComponents.seamailListScreen, path: 'seamail'},
  {screen: CommonStackComponents.seamailChatScreen, path: 'seamail/:fezID'},
  {
    screen: ChatStackScreenComponents.krakenTalkReceiveScreen,
    path: 'phonecall/:callID/from/:callerUserID/:callerUsername',
  },

  // ==================== LFG Tab Routes ====================
  {screen: LfgStackComponents.lfgListScreen, path: 'lfg/:endpoint?'},
  {screen: CommonStackComponents.lfgChatScreen, path: 'lfg/:fezID/chat'},
  {screen: CommonStackComponents.lfgHelpScreen, path: 'lfg/faq'},
  {screen: CommonStackComponents.lfgScreen, path: 'lfg/:fezID'},

  // ==================== Schedule Tab Routes ====================
  {screen: CommonStackComponents.scheduleDayScreen, path: 'events'},
  {screen: CommonStackComponents.eventScreen, path: 'events/:eventID'},
  {screen: CommonStackComponents.personalEventScreen, path: 'privateevent/:eventID'},

  // ==================== Forum Tab Routes ====================
  {screen: ForumStackComponents.forumCategoriesScreen, path: 'forums'},
  {screen: ForumStackComponents.forumCategoryScreen, path: 'forums/:categoryID'},
  {screen: ForumStackComponents.forumPostMentionScreen, path: 'forumpost/mentions'},
  {screen: CommonStackComponents.forumThreadPostScreen, path: 'forum/containingpost/:postID'},
  {screen: CommonStackComponents.forumThreadScreen, path: 'forum/:forumID'},
];

/**
 * Routes that support push navigation from anywhere in the app.
 * These are CommonStackComponents that are available in all content stacks.
 * Subset of allRoutes used for in-app link handling.
 */
export const pushableRoutes: RouteDefinition[] = allRoutes.filter(route =>
  [
    // Forum routes
    CommonStackComponents.forumThreadPostScreen,
    CommonStackComponents.forumThreadScreen,
    // Event routes
    CommonStackComponents.eventScreen,
    CommonStackComponents.personalEventScreen,
    // LFG routes
    CommonStackComponents.lfgChatScreen,
    CommonStackComponents.lfgScreen,
    // Seamail routes
    CommonStackComponents.seamailChatScreen,
    // User routes
    CommonStackComponents.userProfileScreen,
    CommonStackComponents.usernameProfileScreen,
    CommonStackComponents.mapScreen,
    // Performer routes
    CommonStackComponents.performerScreen,
    // Info routes
    CommonStackComponents.privacyScreen,
  ].includes(route.screen as CommonStackComponents),
);

/**
 * Get the path pattern for a screen.
 * Throws if the screen is not found (to catch misconfigurations early).
 */
export const getPath = (screen: string): string => {
  const route = allRoutes.find(r => r.screen === screen);
  if (!route) {
    throw new Error(`[RouteDefinitions.ts] Screen "${screen}" not found in allRoutes.`);
  }
  return route.path;
};

/**
 * Extract parameter names from a path pattern.
 * e.g., 'forum/:forumID' -> ['forumID']
 * e.g., 'lfg/:fezID/chat' -> ['fezID']
 * e.g., 'map/:deckNumber?' -> ['deckNumber']
 */
export const extractParamNames = (path: string): string[] => {
  const matches = path.match(/:[^/?]+/g) || [];
  return matches.map(m => m.replace(/^:/, '').replace(/\?$/, ''));
};

/**
 * Convert a path pattern to a regex for URL matching.
 * e.g., 'forum/:forumID' -> /^forum\/([^/]+)$/
 * e.g., 'map/:deckNumber?' -> /^map(?:\/([^/]+))?$/
 */
export const pathToRegex = (path: string): RegExp => {
  let regexStr = path;

  // Handle optional parameters (e.g., :deckNumber?)
  // Replace :param? with an optional group that captures the value
  regexStr = regexStr.replace(/:([^/?]+)\?/g, '(?:/([^/]+))?');

  // Handle required parameters (e.g., :forumID)
  regexStr = regexStr.replace(/:([^/]+)/g, '([^/]+)');

  // Escape forward slashes (but not those in non-capturing groups we just added)
  // Split by the optional groups, escape slashes in each part, rejoin
  const parts = regexStr.split(/(\(\?:[^)]+\)\?)/);
  regexStr = parts
    .map((part, i) => {
      // Odd indices are our optional groups, don't escape those
      if (i % 2 === 1) {
        return part;
      }
      return part.replace(/\//g, '\\/');
    })
    .join('');

  return new RegExp(`^${regexStr}$`);
};

/**
 * Find a route definition by screen name.
 */
export const findRouteByScreen = (screen: string): RouteDefinition | undefined => {
  return allRoutes.find(r => r.screen === screen);
};

/**
 * Find a route definition by path pattern.
 */
export const findRouteByPath = (path: string): RouteDefinition | undefined => {
  return allRoutes.find(r => r.path === path);
};
