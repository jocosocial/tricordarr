import {createContext, useContext} from 'react';

import {AccountPreferences} from '#src/Libraries/AppConfig';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Account, ServerProfile, Session} from '#src/Structs/SessionStructs';

/**
 * Result of asking to switch accounts. 'needs-login' means the target has no usable token (signed
 * out or revoked), so nothing changed and the caller should open the login form for it.
 */
export type SwitchResult = 'switched' | 'needs-login' | 'ignored';

export interface SignInOptions {
  /**
   * The swiftarr_session webview cookie from the site login. Stored with the account before the
   * switch so AccountCookieSync finds it when the new scope mounts.
   */
  siteCookie?: string | null;
  /**
   * Boarding: the pre-registration session this sign-in replaces. Everything on that session's
   * server is deleted in the same step, and its account's preferences seed the new account.
   */
  boardFromSessionID?: string;
}

export interface SwitchOptions {
  /**
   * Called after the switch is accepted and before anything is torn down. Freeze the visible
   * screen so it does not flash the new account's (or no account's) state.
   */
  onSwitchStart?: () => void;
  /**
   * Restore the navigation stack after the keyed remount instead of starting from the root's
   * initial route. For flows that switch mid-stack (the OOBE server step).
   */
  preserveNavigation?: boolean;
  /**
   * Boarding without an account (switchToServer only): the pre-registration session being left.
   * Everything on that session's server is deleted in the same step.
   */
  boardFromSessionID?: string;
}

export interface SessionContextType {
  currentSession: Session | null;
  /** Account of the current session; null when anonymous. */
  currentAccount: Account | null;
  /** The current account's token. Null when anonymous, signed out or revoked. */
  currentToken: TokenStringData | null;
  /** Convenience: currentAccount?.userID. Kept because ~30 files use it. */
  currentUserID: string | null;
  /** Most recently used first. */
  accounts: Account[];
  sessions: Session[];
  serverProfiles: ServerProfile[];
  /** Profile of currentSession's server, if one has been recorded. */
  serverProfile: ServerProfile | null;
  /** The current account's preferences; null when anonymous (device defaults apply). */
  accountPreferences: AccountPreferences | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  /** An account switch is in flight. Further switches are ignored until it settles. */
  pendingAccountID: string | null;
  /**
   * Session just created by a server switch or first sign-in, whose server's client settings
   * have not been read through it yet. ClientSettingsProvider consumes it.
   */
  freshServerSessionID: string | null;
  clearFreshServerSession: () => void;

  /**
   * Record a login: reads /user/whoami, upserts the account on (serverUrl, userID), finds or
   * creates its session and switches to it.
   */
  signIn: (serverUrl: string, token: TokenStringData, options?: SignInOptions) => Promise<Account>;
  /** Clear one account's token (the current one by default) and keep its row. */
  signOut: (accountID?: string) => Promise<void>;
  switchToAccount: (accountID: string, options?: SwitchOptions) => Promise<SwitchResult>;
  switchToSession: (sessionID: string, options?: SwitchOptions) => Promise<void>;
  /** Switch to the anonymous session for a server, creating it if needed. */
  switchToServer: (serverUrl: string, options?: SwitchOptions) => Promise<void>;
  /** Delete a session (and its cache file) without touching its account. For anonymous server sessions. */
  removeSession: (sessionID: string, options?: SwitchOptions) => Promise<void>;
  /** Delete an account, its token, preferences and sessions (with their cache files). */
  removeAccount: (accountID: string, options?: SwitchOptions) => Promise<void>;
  updateAccountPreferences: (accountID: string, patch: Partial<AccountPreferences>) => Promise<void>;
  updateServerProfile: (
    serverUrl: string,
    patch: Partial<Omit<ServerProfile, 'serverUrl' | 'updatedAt'>>,
  ) => Promise<void>;
  /**
   * Locally force pre-registration mode on or off for a server, whatever the server reports.
   * Forcing it to what the server reports clears the override.
   */
  setPreRegistrationOverride: (serverUrl: string, preRegistrationMode: boolean) => Promise<void>;
  /** Record fields learned from whoami. Ignored if `sourceSessionID` is no longer current. */
  updateAccountIdentity: (
    accountID: string,
    patch: Partial<Pick<Account, 'username' | 'displayName' | 'userImage' | 'accessLevel'>>,
    sourceSessionID: string,
  ) => Promise<void>;
  /** A token route returned 401. Ignored if `sourceSessionID` is no longer current. */
  markAccountRevoked: (accountID: string, sourceSessionID: string) => Promise<void>;
  /** Wipe all account-model storage. Only CriticalErrorView's reset uses this. */
  clearAllSessions: () => Promise<void>;
  /** For background code and mark-as-read, which cannot rely on the in-memory state. */
  getTokenForAccount: (accountID: string) => Promise<TokenStringData | null>;
}

export const SessionContext = createContext<SessionContextType>({
  currentSession: null,
  currentAccount: null,
  currentToken: null,
  currentUserID: null,
  accounts: [],
  sessions: [],
  serverProfiles: [],
  serverProfile: null,
  accountPreferences: null,
  isLoggedIn: false,
  isLoading: true,
  pendingAccountID: null,
  freshServerSessionID: null,
  clearFreshServerSession: () => {},
  signIn: async () => {
    throw new Error('SessionProvider not initialized');
  },
  signOut: async () => {},
  switchToAccount: async () => 'ignored',
  switchToSession: async () => {},
  switchToServer: async () => {},
  removeSession: async () => {},
  removeAccount: async () => {},
  updateAccountPreferences: async () => {},
  updateServerProfile: async () => {},
  setPreRegistrationOverride: async () => {},
  updateAccountIdentity: async () => {},
  markAccountRevoked: async () => {},
  clearAllSessions: async () => {},
  getTokenForAccount: async () => null,
});

export const useSession = () => useContext(SessionContext);
