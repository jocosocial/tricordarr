import React, {useEffect, useState} from 'react';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {ServerUrlFormValues} from '../../../../Libraries/Types/FormValues.ts';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext.ts';
import {useQueryClient} from '@tanstack/react-query';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries.ts';
import {RefreshControl} from 'react-native';
import {ServerUrlSettingForm} from '#src/Forms/Settings/ServerUrlSettingForm.tsx';
import {ServerChoices} from '../../../../Libraries/Network/ServerChoices.ts';
import {ServerHealthcheckResultView} from '#src/Views/Settings/ServerHealthcheckResultView.tsx';
import {HttpStatusCode} from 'axios';
import {FormikHelpers} from 'formik';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext.ts';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext.ts';
import {CacheManager} from '@georstat/react-native-image-cache';

export const ConfigServerUrlScreen = () => {
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const {appConfig, updateAppConfig, preRegistrationMode} = useConfig();
  const {signOut} = useAuth();
  const {commonStyles} = useStyles();
  const {clearPrivileges} = usePrivilege();
  const queryClient = useQueryClient();
  const {disruptionDetected, serverUrl} = useSwiftarrQueryClient();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const {hasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();

  const onSave = async (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    const oldServerUrl = serverUrl;
    await queryClient.cancelQueries(['/client/health']);
    if (preRegistrationMode) {
      updateAppConfig({
        ...appConfig,
        preRegistrationServerUrl: values.serverUrl,
      });
    } else {
      updateAppConfig({
        ...appConfig,
        serverUrl: values.serverUrl,
      });
    }

    refetch().then(() =>
      formikHelpers.resetForm({
        values: {
          serverChoice: ServerChoices.fromUrl(values.serverUrl),
          serverUrl: values.serverUrl,
        },
      }),
    );
    if (oldServerUrl !== values.serverUrl) {
      await signOut(preRegistrationMode);
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
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
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
