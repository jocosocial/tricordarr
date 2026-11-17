import {getCurrentPushAccountID} from '#src/Libraries/Notifications/Push/PushAccounts';
import {PerAccountStatus} from '#src/Structs/SocketStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

/**
 * Status of every background notification socket native is holding, one entry per account.
 */
export const getBackgroundStatuses = async (): Promise<PerAccountStatus[]> =>
  await NativeTricordarrModule.getWebsocketStatus();

/**
 * Status of the active account's background notification socket, or undefined if native has none
 * for it.
 */
export const getCurrentBackgroundStatus = async (): Promise<PerAccountStatus | undefined> => {
  const [statuses, accountID] = await Promise.all([getBackgroundStatuses(), getCurrentPushAccountID()]);
  return statuses.find(status => status.accountID === accountID);
};
