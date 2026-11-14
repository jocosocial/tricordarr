import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';

import {ServerUrlSettingForm} from '#src/Components/Forms/Settings/ServerUrlSettingForm';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ServerHealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSignOut} from '#src/Context/Contexts/SignOutContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useServerHealthStatus} from '#src/Hooks/useServerHealthStatus';
import {createLogger} from '#src/Libraries/Logger';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {ServerUrlFormValues} from '#src/Types/FormValues';

const logger = createLogger('ServerUrlSettingsView.tsx');

/**
 * Server URL picker and the healthcheck result for it, shared by the OOBE server step and
 * Settings > Server URL. Saving a new URL switches this session to that server.
 */
export const ServerUrlSettingsView = () => {
  const {currentSession, updateSession} = useSession();
  const {serverUrl} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();
  const {
    healthQuery: {refetch},
  } = useServerHealthStatus();
  const {hasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();
  const {performSignOut} = useSignOut();
  const {beginServerSwitch, cancelServerSwitch} = useClientSettings();

  /**
   * Persists the chosen server URL to the session. Covers only that local update; the healthcheck
   * and the new server's client settings load afterwards on their own.
   */
  const onSave = async (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    if (!currentSession) {
      logger.error('Cannot save: no current session');
      return;
    }

    const oldServerUrl = currentSession.serverUrl;
    const serverUrlChanging = oldServerUrl !== values.serverUrl;

    if (serverUrlChanging) {
      // Suppress the generic error Snackbar for the duration of the swap: mounted screens'
      // queries will refire against the new server immediately (query keys embed serverUrl)
      // and may 401 with "maintenance mode" before we've confirmed that state ourselves.
      // ClientSettingsProvider ends it once the new server's client settings are applied.
      beginServerSwitch(values.serverUrl);
    }

    // Cancel in-flight requests before anything changes, to shrink (not eliminate - mounted
    // queries key off serverUrl and will still auto-refetch) the race window against the old
    // server/baseURL.
    await queryClient.cancelQueries();

    try {
      if (serverUrlChanging) {
        const sessionID = currentSession.sessionID;
        // Perform sign-out first so FGS is stopped and notifications disabled before any re-render.
        // Otherwise updateSession(serverUrl) triggers signOut() and a re-render with isLoggedIn=false
        // but enableUserNotifications still true, so PushNotificationService starts the FGS worker
        // which then calls buildWebSocket() with no token.
        await performSignOut();
        // Update session serverUrl only (token already cleared by performSignOut; updateSession will not call signOut again).
        await updateSession(sessionID, {serverUrl: values.serverUrl});
        // No refetch() or updateClientSettings() here: the API client and query keys are derived
        // from React state, so until the next render they would hit the OLD server. The health
        // query's key changes on re-render and, with gcTime/staleTime 0, fetches against the new
        // server on its own. ClientSettingsProvider applies the new server's client settings
        // (pre-registration mode, cruise config) once its query re-keys and loads. Save covers
        // only this local session update; ServerHealthcheckResultView shows the check itself.
      } else {
        // Update session serverUrl - persists immediately
        await updateSession(currentSession.sessionID, {serverUrl: values.serverUrl});
        // Same URL, so the current query key is correct. This is how a failed healthcheck gets
        // retried, since the health query never re-runs an error on its own. Not awaited: Save
        // covers only the session update, and ServerHealthcheckResultView shows the check.
        refetch();
      }
    } catch (error) {
      // The swap didn't happen, so nothing will arrive to end the suppression or apply settings.
      if (serverUrlChanging) {
        cancelServerSwitch();
      }
      throw error;
    } finally {
      formikHelpers.resetForm({
        values: {
          serverChoice: ServerChoices.fromUrl(values.serverUrl),
          serverUrl: values.serverUrl,
        },
      });
    }
    setSnackbarPayload(undefined);
  };

  return (
    <View>
      <PaddedContentView>
        <ServerUrlSettingForm
          onSubmit={onSave}
          initialValues={{
            serverChoice: ServerChoices.fromUrl(serverUrl),
            serverUrl: serverUrl,
          }}
        />
      </PaddedContentView>
      {!hasUnsavedWork && (
        <PaddedContentView>
          <ServerHealthcheckResultView />
        </PaddedContentView>
      )}
    </View>
  );
};
