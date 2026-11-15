import {PerAccountStatus} from '#src/Structs/SocketStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

/**
 * Status of the current account's background notification socket, or undefined if native has none
 * yet. Only one account is synced today (and iOS runs a single extension socket), so the first
 * entry is the current one.
 */
export const getCurrentBackgroundStatus = async (): Promise<PerAccountStatus | undefined> => {
  const [status] = await NativeTricordarrModule.getWebsocketStatus();
  return status;
};
