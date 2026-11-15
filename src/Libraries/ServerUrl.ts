import URLParse from 'url-parse';

/**
 * Canonical form of a server URL, used wherever one identifies an Account, Session or ServerProfile:
 * lowercase scheme and host, port kept unless it is the scheme default, no path, no trailing slash.
 * Input that does not parse as an absolute URL comes back trimmed of trailing slashes only.
 */
export const normalizeServerUrl = (url: string): string => {
  const trimmed = url.trim();
  const parsed = new URLParse(trimmed);
  if (!parsed.protocol || !parsed.host) {
    return trimmed.replace(/\/+$/, '');
  }
  return `${parsed.protocol.toLowerCase()}//${parsed.host.toLowerCase()}`;
};

/**
 * Compact "host" form of a server URL for list rows (no scheme).
 */
export const serverUrlHost = (url: string): string => url.replace(/^https?:\/\//, '');
