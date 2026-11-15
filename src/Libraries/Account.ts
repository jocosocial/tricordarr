import {serverUrlHost} from '#src/Libraries/ServerUrl';
import {Account, ServerProfile} from '#src/Structs/SessionStructs';

/**
 * `username`, or the userID until the username has been fetched (migrated accounts).
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
 * Accounts in a fixed display order (oldest first), unlike the store's most-recently-used order,
 * so lists do not reshuffle when the active account changes.
 */
export const sortAccountsForDisplay = (accounts: Account[]): Account[] =>
  [...accounts].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.accountID.localeCompare(b.accountID));

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
