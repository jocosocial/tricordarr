import {serverUrlHost} from '#src/Libraries/ServerUrl';
import {Account, ServerProfile, Session} from '#src/Structs/SessionStructs';

/**
 * `username`, or the userID if the username has not been fetched yet.
 */
export const accountName = (account: Account): string => account.username || account.userID;

/**
 * `username@server` label used in alerts and rows.
 */
export const accountLabel = (account: Account): string => `${accountName(account)}@${serverUrlHost(account.serverUrl)}`;

/**
 * User-facing status of an account for a badge, or undefined when nothing needs saying.
 */
export const accountStatusLabel = (account: Account): string | undefined => {
  switch (account.status) {
    case 'signedOut':
      return 'Signed out';
    case 'revoked':
      return 'Signed out remotely';
    default:
      return undefined;
  }
};

/**
 * Name shown for an anonymous session, which has no account to name it by.
 */
export const anonymousSessionName = 'nobody';

/**
 * `nobody@server` label for an anonymous session, in the same shape as accountLabel.
 */
export const anonymousSessionLabel = (session: Session): string =>
  `${anonymousSessionName}@${serverUrlHost(session.serverUrl)}`;

/**
 * One row of the account lists: an account, or an anonymous session on a server.
 */
export type AccountListEntry =
  | {kind: 'account'; key: string; createdAt: string; account: Account}
  | {kind: 'anonymous'; key: string; createdAt: string; session: Session};

/**
 * Accounts and anonymous sessions in a fixed display order (oldest first), unlike the store's
 * most-recently-used order, so lists do not reshuffle when the active session changes.
 */
export const getAccountListEntries = (accounts: Account[], sessions: Session[]): AccountListEntry[] => {
  const entries: AccountListEntry[] = [
    ...accounts.map(account => ({
      kind: 'account' as const,
      key: account.accountID,
      createdAt: account.createdAt,
      account,
    })),
    ...sessions
      .filter(session => session.accountID === null)
      .map(session => ({kind: 'anonymous' as const, key: session.sessionID, createdAt: session.createdAt, session})),
  ];
  return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.key.localeCompare(b.key));
};

/**
 * Whether a server is in pre-registration mode. It is a property of the server, so every session
 * on it agrees. A local override wins over what the server reports.
 */
export const isServerPreRegistration = (
  profile?: Pick<ServerProfile, 'preRegistrationMode' | 'preRegistrationOverride'> | null,
): boolean => profile?.preRegistrationOverride ?? profile?.preRegistrationMode ?? false;

/**
 * Whether the account's server is in pre-registration mode.
 */
export const isAccountPreRegistration = (account: Account, serverProfiles: ServerProfile[]): boolean =>
  isServerPreRegistration(serverProfiles.find(p => p.serverUrl === account.serverUrl));
