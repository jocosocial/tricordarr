import {CacheManager} from '@georstat/react-native-image-cache';
import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {HttpStatusCode} from 'axios';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ServerUrlSettingForm} from '#src/Components/Forms/Settings/ServerUrlSettingForm';
import {OobeServerHeaderTitle} from '#src/Components/Navigation/OobeServerHeaderTitle';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {ServerHealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {ServerUrlFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen>;

export const OobeServerScreen = ({navigation}: Props) => {
  const {currentSession, updateSession} = useSession();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const getHeaderTitle = useCallback(() => <OobeServerHeaderTitle />, []);
  const {hasUnsavedWork} = useErrorHandler();
  const {clearPrivileges} = usePrivilege();
  const {serverUrl} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();

  const onSave = async (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    if (!currentSession) {
      console.error('[OobeServerScreen] Cannot save: no current session');
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
      clearPrivileges();
      queryClient.clear();
      await CacheManager.clearCache();
    }
    setSnackbarPayload(undefined);
  };

  const onBackPress = () => {
    navigation.goBack();
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

  const preRegistrationMode = currentSession?.preRegistrationMode ?? false;

  return (
    <AppView>
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={isFetching} onRefresh={refetch} />}>
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
        leftOnPress={onBackPress}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeConductScreen)}
        rightDisabled={!serverHealthPassed || isFetching || hasUnsavedWork}
      />
    </AppView>
  );
};
