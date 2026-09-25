import {ParamListBase, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {HttpStatusCode} from 'axios';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ServerUrlSettingForm} from '#src/Components/Forms/Settings/ServerUrlSettingForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ServerHealthcheckResultView} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSignOut} from '#src/Context/Contexts/SignOutContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {createLogger} from '#src/Libraries/Logger';
import {ServerChoices} from '#src/Libraries/Network/ServerChoices';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {ServerUrlFormValues} from '#src/Types/FormValues';

const logger = createLogger('ConfigServerUrlScreen.tsx');

export const ConfigServerUrlScreen = () => {
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const {currentSession, updateSession} = useSession();
  const {commonStyles} = useStyles();
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const queryClient = useQueryClient();
  const {disruptionDetected, setServerSwitchInProgress} = useSwiftarrQueryClient();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const {hasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();
  const {performSignOut} = useSignOut();
  const {updateClientSettings} = useClientSettings();

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
      setServerSwitchInProgress(true);
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
        // Resolve maintenance-mode state deterministically as part of the swap, rather than
        // relying on the client-settings query incidentally refetching due to its key changing.
        await updateClientSettings();
      } else {
        // Update session serverUrl - persists immediately
        await updateSession(currentSession.sessionID, {serverUrl: values.serverUrl});
      }

      await refetch().finally(() =>
        formikHelpers.resetForm({
          values: {
            serverChoice: ServerChoices.fromUrl(values.serverUrl),
            serverUrl: values.serverUrl,
          },
        }),
      );
    } finally {
      if (serverUrlChanging) {
        setServerSwitchInProgress(false);
      }
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

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.navigate(CommonStackComponents.networkHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text>Do not change this unless instructed to do so by the Twitarr Dev Team or THO.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <ServerUrlSettingForm
            onSubmit={onSave}
            initialValues={{
              serverChoice: ServerChoices.fromUrl(currentSession?.serverUrl || ''),
              serverUrl: currentSession?.serverUrl || '',
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
