import {ShipCode} from '#src/Enums/ShipCode';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';

/**
 * Who. Deduped on (normalized serverUrl, userID). The token lives in SecureStore
 * (ACCOUNT_TOKEN_V1_<accountID>), not here.
 */
export interface Account {
  /** UUID. Stable; used in storage keys. */
  accountID: string;
  /** Normalized: scheme+host+port, no trailing slash. See normalizeServerUrl. */
  serverUrl: string;
  userID: string;
  /** Captured from /user/whoami after login, for the switcher. Empty until it has been fetched. */
  username: string;
  displayName?: string;
  userImage?: string;
  /** Refreshed from whoami; the login-time snapshot on the token goes stale. */
  accessLevel: UserAccessLevel;
  /** 'signedOut' keeps the row (the Bluesky pattern); 'revoked' means the server rejected the token. */
  status: AccountStatus;
  createdAt: string; // ISO date string
  lastUsedAt: string; // ISO date string
}

export type AccountStatus = 'signedIn' | 'signedOut' | 'revoked';

/**
 * Which server. Keyed on normalized serverUrl. Replaces the per-server fields that used to live in
 * AppConfig.
 */
export interface ServerProfile {
  serverUrl: string;
  /** From /client/settings; detects a reset or different database. */
  installationID?: string;
  cruiseStartDateStr?: string;
  cruiseLength?: number;
  portTimeZoneID?: string;
  schedBaseUrl?: string;
  canonicalHostnames?: string[];
  shipCode?: ShipCode;
  /**
   * Whether the server is in pre-registration mode: its own enablePreregistration from
   * /client/settings, or an assumption until that has been read.
   */
  preRegistrationMode?: boolean;
  /**
   * A local decision that wins over the server's value: the developer toggle, or the banner's
   * hidden "disable pre-registration". Unset means follow the server.
   */
  preRegistrationOverride?: boolean;
  /** Seeded from shipWifiSSID. */
  wifiNetworkNames: string[];
  dismissMinAccessWarning: boolean;
  updatedAt: string; // ISO date string
}

/**
 * The active context. The sessionID-keyed cache files and query keys hang off this.
 * Deduped on (serverUrl, accountID). LAST_SESSION_ID is the one pointer
 * that background code reads.
 */
export interface Session {
  sessionID: string; // UUID
  serverUrl: string;
  /** null means anonymous (flexRoutes) browsing on that server. */
  accountID: string | null;
  createdAt: string; // ISO date string
  lastUsedAt: string; // ISO date string
}
