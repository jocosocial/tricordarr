import {allRoutes, extractParamNames, pathToRegex, pushableRoutes} from '#src/Libraries/RouteDefinitions';

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
 * Extract the path (with query string) from a tricordarr:// URL.
 * Returns undefined if the URL doesn't match the expected format.
 *
 * @param url - Full URL like "tricordarr://forum/abc123?param=value" or "tricordarr:/forum/abc123"
 * @returns The path portion with query string, e.g., "forum/abc123?param=value"
 */
export const extractPathFromTricordarrUrl = (url: string): string | undefined => {
  // Handle both tricordarr:// and tricordarr:/ formats
  const match = url.match(/^tricordarr:\/\/?(.*)$/);
  return match ? match[1] : undefined;
};
