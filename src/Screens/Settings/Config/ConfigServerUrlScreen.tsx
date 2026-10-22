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
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const {hasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();
  const {performSignOut} = useSignOut();
  const {beginServerSwitch, cancelServerSwitch} = useClientSettings();

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
        // (pre-registration mode, cruise config) once its query re-keys and loads.
      } else {
        // Update session serverUrl - persists immediately
        await updateSession(currentSession.sessionID, {serverUrl: values.serverUrl});
        // Same URL, so the current query key is correct. This is how a failed healthcheck gets
        // retried, since the health query never re-runs an error on its own.
        await refetch();
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
