import {useCallback} from 'react';

import {useDeviceConfig} from '#src/Context/Contexts/DeviceConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';
import {createLogger} from '#src/Libraries/Logger';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Account} from '#src/Structs/SessionStructs';
import {OnboardingMode} from '#src/Types/RouteParams';

const logger = createLogger('useOnboardingCommit.ts');

/**
 * The one point where the setup flow changes the active session: a login, a new account, or
 * proceeding without one. Everything before it only looked at a server. What else the commit does
 * depends on why the flow is running (see OnboardingMode); with no mode it is a plain sign-in.
 *
 * The session change remounts the session scope, so the calling screen is normally gone by the
 * time these resolve.
 */
export const useOnboardingCommit = (mode?: OnboardingMode) => {
  const {signIn, switchToServer, currentSession, accountPreferences} = useSession();
  const {deviceConfig, updateDeviceConfig} = useDeviceConfig();
  const {oobeCompleted, setResumeAfterCommit} = useOobe();
  const {clearCookies} = useTwitarrWebview();

  /**
   * Work that has to happen before the dispatch, since nothing here survives it. Returns the
   * pre-registration session to retire when boarding.
   */
  const prepare = useCallback(async (): Promise<string | undefined> => {
    // Both continue to the permissions and finish steps on the far side of the remount.
    if (mode === 'firstRun' || mode === 'boarding') {
      setResumeAfterCommit(true);
    }
    if (mode !== 'boarding' || !currentSession) {
      return undefined;
    }
    // The store deletes the stored cookie with the account; this is the webview's own copy.
    try {
      await clearCookies(currentSession.serverUrl);
    } catch (error) {
      logger.warn('Failed to clear the pre-registration site cookie:', error);
    }
    return currentSession.sessionID;
  }, [mode, currentSession, setResumeAfterCommit, clearCookies]);

  /**
   * Commit by signing in with a token already obtained from `serverUrl`.
   */
  const commitSignIn = useCallback(
    async (serverUrl: string, token: TokenStringData, siteCookie?: string | null): Promise<Account> => {
      const boardFromSessionID = await prepare();
      const account = await signIn(serverUrl, token, {siteCookie, boardFromSessionID});
      // Signing in to the account that is already active changes no session, so nothing remounts
      // and there is nothing to resume.
      if (currentSession?.accountID === account.accountID && currentSession.serverUrl === account.serverUrl) {
        setResumeAfterCommit(false);
      }
      // During first-run setup the finish step starts push, after the permissions step.
      if (oobeCompleted) {
        await startPushProvider();
      }
      return account;
    },
    [prepare, signIn, oobeCompleted, currentSession, setResumeAfterCommit],
  );

  /**
   * Commit without an account, to the anonymous session for `serverUrl`.
   *
   * Boarding this way deletes the pre-registration account with no account to hand its
   * preferences to, so they become the device defaults: what the anonymous session uses, and what
   * an account signed in later starts from.
   */
  const commitAnonymous = useCallback(
    async (serverUrl: string): Promise<void> => {
      const boardFromSessionID = await prepare();
      if (boardFromSessionID && accountPreferences) {
        updateDeviceConfig({...deviceConfig, defaultPreferences: accountPreferences});
      }
      await switchToServer(serverUrl, {boardFromSessionID});
    },
    [prepare, switchToServer, accountPreferences, deviceConfig, updateDeviceConfig],
  );

  return {commitSignIn, commitAnonymous};
};
