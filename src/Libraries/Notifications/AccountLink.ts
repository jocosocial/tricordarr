/**
 * A notification belongs to the account it was delivered for, which may not be the active one by
 * the time it is tapped. The native side marks each notification's deep link with that account
 * (`tricordarr://seamail/<id>?account=<accountID>`); these helpers read and remove the marker,
 * and hold a link across the session switch it causes.
 */
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

interface PendingAccountLink {
  accountID: string;
  url: string;
}

let pendingLink: PendingAccountLink | undefined;

/**
 * Hold a link until its account is the active one. Switching accounts remounts everything under
 * SessionBoundaryProvider, so this lives at module scope to survive it.
 */
export const stashAccountLink = (accountID: string, url: string): void => {
  pendingLink = {accountID, url};
};

/**
 * Take (and clear) the held link if it is for the given account. A link held for any other
 * account is dropped: the switch it was waiting for did not happen.
 */
export const consumeAccountLink = (accountID?: string | null): string | undefined => {
  const link = pendingLink;
  pendingLink = undefined;
  return link && link.accountID === accountID ? link.url : undefined;
};

/**
 * Forget the held link, for a switch that did not go through.
 */
export const clearAccountLink = (): void => {
  pendingLink = undefined;
};
