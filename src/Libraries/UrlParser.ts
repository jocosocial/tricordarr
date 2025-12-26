import {extractParamNames, pathToRegex, pushableRoutes} from '#src/Libraries/RouteDefinitions';

interface ParsedRoute {
  screen: string;
  params?: Record<string, string>;
}

/**
 * Pre-computed route matchers for efficient URL parsing.
 * Generated from the pushable route definitions (routes that support push navigation).
 */
const routeMatchers = pushableRoutes.map(route => ({
  screen: route.screen,
  pattern: pathToRegex(route.path),
  paramNames: extractParamNames(route.path),
}));

/**
 * Parse a deep link URL path into a screen name and params.
 * Returns undefined if no matching route is found.
 *
 * @param urlPath - The path portion of the URL (without the scheme), e.g., "forum/abc123"
 */
export const parseDeepLinkUrl = (urlPath: string): ParsedRoute | undefined => {
  // Remove leading slash if present
  const cleanPath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;

  for (const matcher of routeMatchers) {
    const match = cleanPath.match(matcher.pattern);
    if (match) {
      const params: Record<string, string> = {};
      matcher.paramNames.forEach((paramName, index) => {
        const value = match[index + 1];
        if (value !== undefined) {
          params[paramName] = value;
        }
      });

      return {
        screen: matcher.screen,
        params: Object.keys(params).length > 0 ? params : undefined,
      };
    }
  }

  return undefined;
};

/**
 * Extract the path from a tricordarr:// URL.
 * Returns undefined if the URL doesn't match the expected format.
 *
 * @param url - Full URL like "tricordarr://forum/abc123" or "tricordarr:/forum/abc123"
 */
export const extractPathFromTricordarrUrl = (url: string): string | undefined => {
  // Handle both tricordarr:// and tricordarr:/ formats
  const match = url.match(/^tricordarr:\/\/?(.*)$/);
  return match ? match[1] : undefined;
};
