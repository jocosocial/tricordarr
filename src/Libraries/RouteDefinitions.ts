import {ChatStackScreenComponents} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ForumStackComponents} from '#src/Navigation/Stacks/Forum/ForumStackComponents';
import {LfgStackComponents} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {OobeStackComponents} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {RootStackComponents} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

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
  {screen: CommonStackComponents.adminScreen, path: 'admin'},
  {screen: CommonStackComponents.aboutTricordarrScreen, path: 'about-app'},
  {screen: CommonStackComponents.aboutTwitarrScreen, path: 'about'},
  {screen: CommonStackComponents.privacyScreen, path: 'privacy'},
  {screen: MainStackComponents.faqScreen, path: 'faq'},
  {screen: CommonStackComponents.siteUIScreen, path: 'twitarrtab/:timestamp?/:resource?/:id?/:action?'},
  {screen: MainStackComponents.userDirectoryScreen, path: 'users'},
  {screen: MainStackComponents.conductScreen, path: 'codeOfConduct'},
  {screen: CommonStackComponents.dailyThemesScreen, path: 'dailyThemes'},
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
  {screen: MainStackComponents.huntListScreen, path: 'hunts'},
  {screen: CommonStackComponents.huntScreen, path: 'hunt/:huntID'},
  {screen: CommonStackComponents.huntPuzzleScreen, path: 'puzzle/:puzzleID'},
  {screen: CommonStackComponents.userSelfProfileScreen, path: 'profile'},

  // ==================== Settings Routes ====================
  {screen: SettingsStackScreenComponents.settings, path: 'settings'},
  {screen: SettingsStackScreenComponents.pushNotificationSettings, path: 'settings/pushnotifications'},
  {
    screen: SettingsStackScreenComponents.backgroundConnectionSettings,
    path: 'settings/backgroundconnection',
  },
  {screen: SettingsStackScreenComponents.login, path: 'login'},

  // ==================== User Routes ====================
  {screen: CommonStackComponents.userProfileScreen, path: 'user/:userID'},
  {screen: CommonStackComponents.usernameProfileScreen, path: 'username/:username'},
  {screen: CommonStackComponents.usersList, path: 'favorites'},
  {screen: CommonStackComponents.mapScreen, path: 'map/:deckNumber?'},

  // ==================== Seamail Tab Routes ====================
  {screen: ChatStackScreenComponents.seamailListScreen, path: 'seamail'},
  {screen: CommonStackComponents.seamailChatScreen, path: 'seamail/:fezID'},
  {screen: CommonStackComponents.privateEventChatScreen, path: 'privateevent/:fezID/chat'},
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
  {screen: CommonStackComponents.eventFeedbackFormScreen, path: 'eventfeedback/form/:eventUID'},
  {screen: CommonStackComponents.eventFeedbackSelectScreen, path: 'eventfeedback'},

  // ==================== Forum Tab Routes ====================
  {screen: ForumStackComponents.forumCategoriesScreen, path: 'forums'},
  {screen: ForumStackComponents.forumCategoryScreen, path: 'forums/:categoryID'},
  {screen: ForumStackComponents.forumPostMentionScreen, path: 'forumpost/mentions'},
  {screen: CommonStackComponents.forumThreadPostScreen, path: 'forum/containingpost/:postID'},
  {screen: CommonStackComponents.forumThreadScreen, path: 'forum/:forumID'},

  // ==================== Moderator Routes ====================
  {screen: CommonStackComponents.microKaraokeSongModerateScreen, path: 'moderate/microkaraoke/song/:id'},
  {screen: CommonStackComponents.microKaraokeSongsModerateScreen, path: 'moderate/microkaraoke'},
  {screen: CommonStackComponents.forumPostModerateScreen, path: 'moderate/forumpost/:id'},
  {screen: CommonStackComponents.forumModerateScreen, path: 'moderate/forum/:id'},
  {screen: CommonStackComponents.fezPostModerateScreen, path: 'moderate/fezpost/:id'},
  {screen: CommonStackComponents.fezModerateScreen, path: 'moderate/lfg/:id'},
  {screen: CommonStackComponents.profileModerateScreen, path: 'moderate/userprofile/:id'},
  {screen: CommonStackComponents.userModerateScreen, path: 'moderate/user/:id'},
  {screen: CommonStackComponents.photostreamModerateScreen, path: 'moderate/photostream/:id'},
  {screen: CommonStackComponents.personalEventModerateScreen, path: 'moderate/personalevent/:id'},
  {screen: CommonStackComponents.moderatorLogScreen, path: 'moderator/log'},
  {screen: CommonStackComponents.moderatorSeamailScreen, path: 'moderator/seamail'},
  {screen: CommonStackComponents.moderatorGuideScreen, path: 'moderator/guide'},
  {screen: CommonStackComponents.moderatorForumMentionsScreen, path: 'moderator/mentions'},
  {screen: CommonStackComponents.moderatorReportsScreen, path: 'reports/:closed?'},
  {screen: CommonStackComponents.moderatorRootScreen, path: 'moderator'},
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
    CommonStackComponents.eventFeedbackSelectScreen,
    CommonStackComponents.eventFeedbackFormScreen,
    // LFG routes
    CommonStackComponents.lfgChatScreen,
    CommonStackComponents.lfgScreen,
    // Seamail routes
    CommonStackComponents.seamailChatScreen,
    CommonStackComponents.privateEventChatScreen,
    // User routes
    CommonStackComponents.userProfileScreen,
    CommonStackComponents.usernameProfileScreen,
    CommonStackComponents.mapScreen,
    // Performer routes
    CommonStackComponents.performerScreen,
    // Hunt routes
    CommonStackComponents.huntScreen,
    CommonStackComponents.huntPuzzleScreen,
    // Info routes
    CommonStackComponents.privacyScreen,
    // Moderator routes
    CommonStackComponents.moderatorRootScreen,
    CommonStackComponents.moderatorReportsScreen,
    CommonStackComponents.moderatorLogScreen,
    CommonStackComponents.moderatorGuideScreen,
    CommonStackComponents.moderatorSeamailScreen,
    CommonStackComponents.moderatorForumMentionsScreen,
    CommonStackComponents.forumPostModerateScreen,
    CommonStackComponents.forumModerateScreen,
    CommonStackComponents.fezModerateScreen,
    CommonStackComponents.fezPostModerateScreen,
    CommonStackComponents.profileModerateScreen,
    CommonStackComponents.userModerateScreen,
    CommonStackComponents.photostreamModerateScreen,
    CommonStackComponents.personalEventModerateScreen,
    CommonStackComponents.microKaraokeSongsModerateScreen,
    CommonStackComponents.microKaraokeSongModerateScreen,
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

  // Handle optional parameters (e.g., :deckNumber?). Consume the slash before the
  // param so `map/:deckNumber?` matches both `map` and `map/3`.
  regexStr = regexStr.replace(/\/:([^/?]+)\?/g, '(?:/([^/]+))?');

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

interface ParsedRoute {
  screen: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Check if a path pattern contains any path parameters (e.g., :param).
 */
const hasPathParams = (path: string): boolean => {
  return /:[^/?]+/.test(path);
};

/**
 * Pre-computed route matchers for literal routes (no path parameters).
 * These are checked first to ensure literal paths like 'lfg/joined' match before
 * parameterized patterns like 'lfg/:fezID'.
 * Generated from allRoutes to include all literal routes, not just pushable ones.
 */
const literalRouteMatchers = allRoutes
  .filter(route => !hasPathParams(route.path))
  .map(route => ({
    screen: route.screen,
    pattern: pathToRegex(route.path),
    paramNames: extractParamNames(route.path),
  }));

/**
 * Pre-computed route matchers for parameterized routes.
 * Generated from the pushable route definitions (routes that support push navigation).
 */
const routeMatchers = pushableRoutes.map(route => ({
  screen: route.screen,
  pattern: pathToRegex(route.path),
  paramNames: extractParamNames(route.path),
}));

/**
 * Convert a query string value to appropriate type (boolean, number, or string).
 */
const convertQueryValue = (value: string): string | number | boolean => {
  // Convert "true" or "false" to boolean
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  // Try to convert to number if it's a valid number string
  const numValue = Number(value);
  if (!isNaN(numValue) && isFinite(numValue) && value.trim() !== '') {
    return numValue;
  }
  // Return as string
  return value;
};

/**
 * Parse query string parameters from a URL path.
 * Returns an object with parsed and type-converted values.
 */
const parseQueryParams = (queryString: string): Record<string, string | number | boolean> => {
  const params: Record<string, string | number | boolean> = {};
  if (!queryString) {
    return params;
  }

  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=').map(decodeURIComponent);
    if (key) {
      params[key] = convertQueryValue(value || '');
    }
  }
  return params;
};

/**
 * Parse a deep link URL path into a screen name and params.
 * Returns undefined if no matching route is found.
 *
 * @param urlPath - The path portion of the URL (without the scheme), e.g., "forum/abc123" or "seamail?onlyNew=true"
 */
export const parseDeepLinkUrl = (urlPath: string): ParsedRoute | undefined => {
  // Remove leading slash if present
  const pathWithQuery = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;

  // Split path and query string
  const [path, queryString] = pathWithQuery.split('?');
  const cleanPath = path;

  // Parse query parameters
  const queryParams = queryString ? parseQueryParams(queryString) : {};

  // Helper function to match a route and return parsed result
  const tryMatch = (matcher: {screen: string; pattern: RegExp; paramNames: string[]}): ParsedRoute | undefined => {
    const match = cleanPath.match(matcher.pattern);
    if (match) {
      const params: Record<string, string | number | boolean> = {};
      // Extract path parameters
      matcher.paramNames.forEach((paramName, index) => {
        const value = match[index + 1];
        if (value !== undefined) {
          params[paramName] = value;
        }
      });

      // Merge query parameters (query params override path params if there's a conflict)
      Object.assign(params, queryParams);

      return {
        screen: matcher.screen,
        params: Object.keys(params).length > 0 ? params : undefined,
      };
    }
    return undefined;
  };

  // Check literal routes first (e.g., 'lfg/joined', 'lfg/faq')
  // This ensures literal paths match before parameterized patterns
  for (const matcher of literalRouteMatchers) {
    const result = tryMatch(matcher);
    if (result) {
      return result;
    }
  }

  // Fall back to parameterized routes from pushableRoutes
  for (const matcher of routeMatchers) {
    const result = tryMatch(matcher);
    if (result) {
      return result;
    }
  }

  return undefined;
};
