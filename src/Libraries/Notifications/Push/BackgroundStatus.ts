import {getCurrentPushAccountID} from '#src/Libraries/Notifications/Push/PushAccounts';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {PerAccountStatus} from '#src/Structs/SocketStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

/**
 * Status of every background notification socket native is holding, one entry per account.
 */
export const getBackgroundStatuses = async (): Promise<PerAccountStatus[]> =>
  await NativeTricordarrModule.getWebsocketStatus();

/**
 * Status of the active account's background notification socket, or undefined if native has none
 * for it. iOS runs a single extension socket for the active account and does not know its ID, so
 * its one entry is the answer there.
 */
export const getCurrentBackgroundStatus = async (): Promise<PerAccountStatus | undefined> => {
  const [statuses, accountID] = await Promise.all([getBackgroundStatuses(), getCurrentPushAccountID()]);
  if (isIOS) {
    return statuses[0];
  }
  return statuses.find(status => status.accountID === accountID);
};
