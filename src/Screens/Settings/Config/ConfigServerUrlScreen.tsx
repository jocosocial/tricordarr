import {CacheManager} from '@georstat/react-native-image-cache';
import {useQueryClient} from '@tanstack/react-query';
import {HttpStatusCode} from 'axios';
import {FormikHelpers} from 'formik';
import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ServerUrlSettingForm} from '#src/Components/Forms/Settings/ServerUrlSettingForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ServerHealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {ServerUrlFormValues} from '#src/Types/FormValues';

export const ConfigServerUrlScreen = () => {
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const {appConfig} = useConfig();
  const {currentSession, updateSession} = useSession();
  const {signOut} = useAuth();
  const {commonStyles} = useStyles();
  const {clearPrivileges} = usePrivilege();
  const queryClient = useQueryClient();
  const {disruptionDetected, serverUrl} = useSwiftarrQueryClient();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const {hasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();

  const onSave = async (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    if (!currentSession) {
      console.error('[ConfigServerUrlScreen] Cannot save: no current session');
      return;
    }

    const oldServerUrl = serverUrl;
    await queryClient.cancelQueries({queryKey: ['/client/health']});

    // Update session serverUrl - persists immediately
    await updateSession(currentSession.sessionID, {serverUrl: values.serverUrl});

    refetch().then(() =>
      formikHelpers.resetForm({
        values: {
          serverChoice: ServerChoices.fromUrl(values.serverUrl),
          serverUrl: values.serverUrl,
        },
      }),
    );
    if (oldServerUrl !== values.serverUrl) {
      await signOut(currentSession.preRegistrationMode);
      clearPrivileges();
      queryClient.clear();
      await CacheManager.clearCache();
    }
    setSnackbarPayload(undefined);
  };

  useEffect(() => {
    if (serverHealthData && serverHealthData.status === HttpStatusCode.Ok) {
      setServerHealthPassed(true);
    } else {
      setServerHealthPassed(false);
    }
  }, [serverHealthData]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>
          <Text>Do not change this unless instructed to do so by the Twitarr Dev Team or THO.</Text>
        </PaddedContentView>
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
            <ServerHealthcheckResultView serverHealthPassed={serverHealthPassed} />
          </PaddedContentView>
        )}
        {disruptionDetected && (
          <PaddedContentView>
            <Text style={[commonStyles.marginBottomSmall]}>
              Connection disruption detected. This can happen for a number of reasons such as:
            </Text>
            <Text>Leaving the ship</Text>
            <Text>Overcrowded or out-of-range WiFi</Text>
            <Text>Server Issue</Text>
            <Text style={[commonStyles.marginBottomSmall]}>VPN on your device</Text>
            <Text>
              If you believe this should not be the case, press the button below to attempt a server health check. If
              the issue persists for more than an hour, contact the JoCo Cruise Info Desk for assistance.
            </Text>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
