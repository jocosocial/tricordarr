/**
 * A notification belongs to the account it was delivered for, which may not be the active one by
 * the time it is tapped. The native side marks each notification's deep link with that account
 * (`tricordarr://seamail/<id>?account=<accountID>`); these helpers read and remove the marker,
 * and hold a link across the session switch it causes. Universal links for a server other than the
 * active one are held the same way, keyed by server since no account has been chosen yet.
 */
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';

const ACCOUNT_PARAM = 'account';

const accountParamPattern = new RegExp(`([?&])${ACCOUNT_PARAM}=([^&#]*)(&?)`);

/**
 * The account a link is addressed to, or undefined if it does not name one.
 */
export const getLinkAccountID = (url: string): string | undefined => {
  const match = accountParamPattern.exec(url);
  return match?.[2] ? decodeURIComponent(match[2]) : undefined;
};

/**
 * The link (or path) without its account marker, leaving any other query parameters in place.
 */
export const stripLinkAccount = (url: string): string =>
  url.replace(accountParamPattern, (_match, lead: string, _id: string, trail: string) => (trail ? lead : ''));

/**
 * Whether a link is addressed to an account other than the active one, and so must not be routed
 * in the current session.
 */
export const isOtherAccountLink = (url: string, currentAccountID?: string | null): boolean => {
  const accountID = getLinkAccountID(url);
  return accountID !== undefined && accountID !== currentAccountID;
};

/**
 * What a held link is waiting for: a particular account (notification taps) or any session on a
 * server (universal links, which cannot name an account before the user chooses one).
 */
type PendingLinkTarget = {accountID: string} | {serverUrl: string};

interface PendingLink {
  target: PendingLinkTarget;
  url: string;
  stashedAt: number;
}

/**
 * How long a held link stays valid. A login the user backed out of must not leave a link armed for
 * a later manual switch.
 */
export const PENDING_LINK_TTL_MS = 10 * 60 * 1000;

let pendingLink: PendingLink | undefined;

/**
 * Hold a link until its account is the active one. Switching accounts remounts everything under
 * SessionBoundaryProvider, so this lives at module scope to survive it.
 */
export const stashAccountLink = (accountID: string, url: string): void => {
  pendingLink = {target: {accountID}, url, stashedAt: Date.now()};
};

/**
 * Hold a link until a session on the given server is the active one, whichever account that is.
 */
export const stashServerLink = (serverUrl: string, url: string): void => {
  pendingLink = {target: {serverUrl: normalizeServerUrl(serverUrl)}, url, stashedAt: Date.now()};
};

/**
 * Take (and clear) the held link if it is for the given session and has not expired. A link held
 * for any other account or server is dropped: the switch it was waiting for did not happen.
 */
export const consumeAccountLink = (session: {accountID?: string | null; serverUrl?: string}): string | undefined => {
  const link = pendingLink;
  pendingLink = undefined;
  if (!link || Date.now() - link.stashedAt > PENDING_LINK_TTL_MS) {
    return undefined;
  }
  const {target} = link;
  const matches =
    'accountID' in target
      ? target.accountID === session.accountID
      : session.serverUrl !== undefined && target.serverUrl === normalizeServerUrl(session.serverUrl);
  return matches ? link.url : undefined;
};

/**
 * Forget the held link, for a switch that did not go through.
 */
export const clearAccountLink = (): void => {
  pendingLink = undefined;
};
