import {getAppConfig} from '#src/Libraries/AppConfig';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

/**
 * An account the native background service connects for, as accepted by
 * `NativeTricordarrModule.syncPushAccounts`. `accountID` is an opaque key native never parses.
 */
export interface PushAccount {
  accountID: string;
  userID: string;
  username: string;
  serverUrl: string;
  urlPrefix: string;
  token: string;
  enabled: boolean;
  prefs: {
    pushNotifications: Record<string, boolean>;
    muteNotificationsUntil?: number;
  };
}

/**
 * Identity used for the single current login until the account model lands. When it does this
 * becomes the real accountID and native needs no change.
 */
export const getCurrentPushAccountID = async (): Promise<string | undefined> => {
  const session = await SessionStorage.getCurrentSession();
  return session?.sessionID;
};

/**
 * The accounts the background service should hold sockets for. Reads storage directly so it works
 * outside React. Empty when signed out, pre-registration, or without a token.
 */
export const buildPushAccounts = async (): Promise<PushAccount[]> => {
  const [session, appConfig] = await Promise.all([SessionStorage.getCurrentSession(), getAppConfig()]);
  const token = session?.tokenData?.token;
  if (!session || !session.serverUrl || !token || session.preRegistrationMode) {
    return [];
  }
  return [
    {
      accountID: session.sessionID,
      userID: session.tokenData?.userID ?? '',
      // Not known outside React yet. Native only shows it when several accounts are active.
      username: '',
      serverUrl: session.serverUrl,
      urlPrefix: appConfig.urlPrefix,
      token,
      enabled: appConfig.enableNotificationSocket,
      prefs: {
        pushNotifications: {...appConfig.pushNotifications},
        muteNotificationsUntil: appConfig.muteNotifications
          ? new Date(appConfig.muteNotifications).getTime()
          : undefined,
      },
    },
  ];
};
