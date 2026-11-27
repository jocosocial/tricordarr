import {FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';

import {ServerUrlSettingForm} from '#src/Components/Forms/Settings/ServerUrlSettingForm';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ServerHealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useServerHealthStatus} from '#src/Hooks/useServerHealthStatus';
import {createLogger} from '#src/Libraries/Logger';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {ServerUrlFormValues} from '#src/Types/FormValues';

const logger = createLogger('ServerUrlSettingsView.tsx');

/**
 * Server URL picker and the healthcheck result for it, shared by the OOBE server step and
 * Settings > Server URL. Saving a new URL switches to the anonymous session for that server;
 * accounts on the old server stay signed in and are one tap away in Accounts.
 */
export const ServerUrlSettingsView = () => {
  const {currentSession, switchToServer} = useSession();
  const {serverUrl} = useSwiftarrQueryClient();
  const {
    healthQuery: {refetch},
  } = useServerHealthStatus();
  const {hasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();

  /**
   * Switches to the chosen server. The switch remounts the session scope, so the healthcheck and the
   * new server's client settings load afterwards on their own (ClientSettingsProvider applies them
   * to the fresh session). Both callers sit mid-stack, so navigation is preserved across the remount.
   */
  const onSave = async (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    if (!currentSession) {
      logger.error('Cannot save: no current session');
      return;
    }
    const newServerUrl = normalizeServerUrl(values.serverUrl);

    try {
      if (newServerUrl !== currentSession.serverUrl) {
        await switchToServer(newServerUrl, {preserveNavigation: true});
      } else {
        // Same URL, so the current query key is correct. This is how a failed healthcheck gets
        // retried, since the health query never re-runs an error on its own. Not awaited: Save
        // covers only the local update, and ServerHealthcheckResultView shows the check.
        void refetch();
      }
    } finally {
      formikHelpers.resetForm({
        values: {
          serverChoice: ServerChoices.fromUrl(newServerUrl),
          serverUrl: newServerUrl,
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
