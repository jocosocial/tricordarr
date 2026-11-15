import {AppConfig, getDeviceConfig, mergeAppConfig} from '#src/Libraries/AppConfig';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

/**
 * The effective config for headless code (background workers, push managers) that cannot reach
 * React context: device config merged with the preferences of the session's account and the
 * profile of its server. Resolves the same merge as `useConfig()`.
 *
 * Without a `sessionID` it follows LAST_SESSION_ID, the one pointer background code reads. With no
 * session (or an anonymous one) preferences come from the device's defaults.
 */
export const getEffectiveConfig = async (sessionID?: string): Promise<AppConfig> => {
  const [device, sessions] = await Promise.all([getDeviceConfig(), SessionStorage.getSessions()]);
  const resolvedID = sessionID ?? (await SessionStorage.getLastSessionID());
  const session = sessions.find(s => s.sessionID === resolvedID);
  if (!session) {
    return mergeAppConfig(device, device.defaultPreferences);
  }
  const [preferences, profiles] = await Promise.all([
    session.accountID ? SessionStorage.getAccountPreferences(session.accountID) : Promise.resolve(null),
    SessionStorage.getServerProfiles(),
  ]);
  const profile = profiles.find(p => p.serverUrl === session.serverUrl);
  return mergeAppConfig(device, preferences ?? device.defaultPreferences, profile);
};
