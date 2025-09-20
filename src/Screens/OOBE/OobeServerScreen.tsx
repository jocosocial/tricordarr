import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator.tsx';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {ServerUrlFormValues} from '../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {useHealthQuery} from '../../Queries/Client/ClientQueries.ts';
import {HttpStatusCode} from 'axios';
import {OobeButtonsView} from '../../Views/OobeButtonsView.tsx';
import {OobeServerHeaderTitle} from '../../Navigation/Components/OobeServerHeaderTitle.tsx';
import {ServerHealthcheckResultView} from '../../Views/Settings/ServerHealthcheckResultView.tsx';
import {ServerUrlSettingForm} from '../../Forms/Settings/ServerUrlSettingForm.tsx';
import {RefreshControl} from 'react-native';
import {ServerChoices} from '../../../Libraries/Network/ServerChoices.ts';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';
import {CacheManager} from '@georstat/react-native-image-cache';
import {useQueryClient} from '@tanstack/react-query';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {useSnackbar} from '../../Context/Contexts/SnackbarContext.ts';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen>;

export const OobeServerScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig, preRegistrationMode} = useConfig();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const getHeaderTitle = useCallback(() => <OobeServerHeaderTitle />, []);
  const {hasUnsavedWork} = useErrorHandler();
  const {clearPrivileges} = usePrivilege();
  const {serverUrl} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();
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

  useEffect(() => {
    navigation.setOptions({
      headerTitle: getHeaderTitle,
    });
  }, [getHeaderTitle, navigation]);

  return (
    <AppView safeEdges={['bottom']}>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {!preRegistrationMode && (
          <PaddedContentView>
            <Text>
              Before proceeding ensure that your phone is on ship WiFi and you have disabled any VPNs, private DNS, or
              other network blockers.
            </Text>
          </PaddedContentView>
        )}
        <PaddedContentView>
          <Text>
            Do not change this unless instructed to do so by the Twitarr Dev Team or THO.
            {preRegistrationMode ? (
              <Text> Should be set to Start during pre-registration.</Text>
            ) : (
              <Text> Should be set to Production when on-board.</Text>
            )}
          </Text>
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
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeConductScreen)}
        rightDisabled={!serverHealthPassed || isFetching || hasUnsavedWork}
      />
    </AppView>
  );
};
