import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {ServerUrlFormValues} from '#src/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {HttpStatusCode} from 'axios';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {OobeServerHeaderTitle} from '#src/Components/Navigation/OobeServerHeaderTitle';
import {ServerHealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {ServerUrlSettingForm} from '#src/Components/Forms/Settings/ServerUrlSettingForm';
import {RefreshControl} from 'react-native';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {CacheManager} from '@georstat/react-native-image-cache';
import {useQueryClient} from '@tanstack/react-query';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';

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
