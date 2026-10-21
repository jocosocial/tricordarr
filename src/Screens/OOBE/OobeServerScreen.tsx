import {StackScreenProps} from '@react-navigation/stack';
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
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {ServerHealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSignOut} from '#src/Context/Contexts/SignOutContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {OobeLocation} from '#src/Enums/OobeLocation';
import {createLogger} from '#src/Libraries/Logger';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {useClientSettingsQuery, useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {ServerUrlFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen>;

const logger = createLogger('OobeServerScreen.tsx');

export const OobeServerScreen = ({navigation, route}: Props) => {
  const location = route.params?.location ?? OobeLocation.ship;
  const {currentSession, updateSession} = useSession();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const {theme} = useAppTheme();
  const {hasUnsavedWork} = useErrorHandler();
  const {serverUrl} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();
  const {performSignOut} = useSignOut();
  const {updateClientSettings} = useClientSettings();
  // Prefetch client settings once the healthcheck passes so pressing Next only writes
  // already-loaded state rather than fetching on tap. Never relies on stale data: this
  // query is disabled until a fresh healthcheck pass and refetches on every mount.
  const {data: clientSettingsData, isFetching: isFetchingClientSettings} = useClientSettingsQuery({
    enabled: serverHealthPassed,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const onSave = async (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    if (!currentSession) {
      logger.error('Cannot save: no current session');
      return;
    }

    const oldServerUrl = currentSession.serverUrl;
    const serverUrlChanging = oldServerUrl !== values.serverUrl;
    await queryClient.cancelQueries({queryKey: ['/client/health']});

    if (serverUrlChanging) {
      const sessionID = currentSession.sessionID;
      // Perform sign-out first so FGS is stopped and notifications disabled before any re-render.
      await performSignOut();
      await updateSession(sessionID, {serverUrl: values.serverUrl});
    } else {
      await updateSession(currentSession.sessionID, {serverUrl: values.serverUrl});
    }

    refetch().finally(() =>
      formikHelpers.resetForm({
        values: {
          serverChoice: ServerChoices.fromUrl(values.serverUrl),
          serverUrl: values.serverUrl,
        },
      }),
    );
    setSnackbarPayload(undefined);
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  const onNextPress = async () => {
    if (!currentSession || !clientSettingsData) {
      logger.warn('Cannot proceed: no current session or client settings not loaded');
      return;
    }
    setBusy(true);
    try {
      // The server's own ClientSettingsData is the source of truth for pre-registration
      // mode, not which location card the user tapped. This lets the URL entered here
      // (whether or not it matches the card that got us here) win.
      await updateSession(currentSession.sessionID, {
        preRegistrationMode: clientSettingsData.enablePreregistration,
      });
      await updateClientSettings(clientSettingsData);
      navigation.push(OobeStackComponents.oobeConductScreen);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (serverHealthData && serverHealthData.status === HttpStatusCode.Ok) {
      setServerHealthPassed(true);
    } else {
      setServerHealthPassed(false);
    }
  }, [serverHealthData]);

  const onHelpPress = () => {
    navigation.push(CommonStackComponents.networkHelpScreen);
  };

  const isLand = location === OobeLocation.land;

  return (
    <AppView>
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {!isLand && (
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
            {isLand ? (
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
        middleText={'Help'}
        middleOnPress={onHelpPress}
        middleIcon={AppIcons.help}
        middleButtonColor={theme.colors.twitarrNegativeButton}
        rightOnPress={onNextPress}
        rightDisabled={
          !serverHealthPassed || isFetching || isFetchingClientSettings || !clientSettingsData || hasUnsavedWork || busy
        }
      />
    </AppView>
  );
};
