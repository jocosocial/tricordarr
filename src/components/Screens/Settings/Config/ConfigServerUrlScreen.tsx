import React, {useEffect, useState} from 'react';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {ServerUrlFormValues} from '../../../../libraries/Types/FormValues';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {Text} from 'react-native-paper';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {configureAxios} from '../../../../libraries/Network/APIClient';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useQueryClient} from '@tanstack/react-query';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext';
import {useHealthQuery} from '../../../Queries/Client/ClientQueries';
import {RefreshControl} from 'react-native';
import {ServerUrlSettingForm} from '../../../Forms/Settings/ServerUrlSettingForm.tsx';
import {ServerChoices} from '../../../../libraries/Network/ServerChoices.ts';
import {ServerHealthcheckResultView} from '../../../Views/Settings/ServerHealthcheckResultView.tsx';
import {HttpStatusCode} from 'axios';
import {FormikHelpers} from 'formik';

export const ConfigServerUrlScreen = () => {
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const {appConfig, updateAppConfig} = useConfig();
  const {signOut} = useAuth();
  const {commonStyles} = useStyles();
  const {clearPrivileges} = usePrivilege();
  const queryClient = useQueryClient();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();

  const onSave = async (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    const oldServerUrl = appConfig.serverUrl;
    updateAppConfig({
      ...appConfig,
      serverUrl: values.serverUrl,
    });
    refetch().then(() =>
      formikHelpers.resetForm({
        values: {
          serverChoice: ServerChoices.fromUrl(values.serverUrl),
          serverUrl: values.serverUrl,
        },
      }),
    );
    if (oldServerUrl !== values.serverUrl) {
      signOut().then(() => {
        clearPrivileges();
        queryClient.clear();
        configureAxios();
      });
    }
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
              serverChoice: ServerChoices.fromUrl(appConfig.serverUrl),
              serverUrl: appConfig.serverUrl,
            }}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ServerHealthcheckResultView
            serverHealthData={serverHealthData}
            serverHealthPassed={serverHealthPassed}
            isFetching={isFetching}
          />
        </PaddedContentView>
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
