import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {ServerUrlSettingsView} from '#src/Components/Views/Settings/ServerUrlSettingsView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {OobeLocation} from '#src/Enums/OobeLocation';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useServerHealthStatus} from '#src/Hooks/useServerHealthStatus';
import {createLogger} from '#src/Libraries/Logger';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {useClientSettingsQuery} from '#src/Queries/Client/ClientQueries';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen>;

const logger = createLogger('OobeServerScreen.tsx');

export const OobeServerScreen = ({navigation, route}: Props) => {
  const location = route.params?.location ?? OobeLocation.ship;
  const {currentSession} = useSession();
  const {
    healthQuery: {refetch, isFetching},
    passed: serverHealthPassed,
  } = useServerHealthStatus();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const [busy, setBusy] = useState(false);
  const {theme} = useAppTheme();
  const {hasUnsavedWork} = useErrorHandler();
  const {applyClientSettings} = useClientSettings();
  // Prefetch client settings once the healthcheck passes so pressing Next only writes
  // already-loaded state rather than fetching on tap. Never relies on stale data: this
  // query is disabled until a fresh healthcheck pass and refetches on every mount.
  const {data: clientSettingsData, isFetching: isFetchingClientSettings} = useClientSettingsQuery({
    enabled: serverHealthPassed,
    staleTime: 0,
    refetchOnMount: 'always',
  });

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
      // (whether or not it matches the card that got us here) win. A server switch on this
      // screen already applied it, but the server the user arrived with never went through one.
      await applyClientSettings(clientSettingsData);
      navigation.push(OobeStackComponents.oobeConductScreen);
    } finally {
      setBusy(false);
    }
  };

  const onHelpPress = () => {
    navigation.push(CommonStackComponents.networkHelpScreen);
  };

  const isLand = location === OobeLocation.land;

  return (
    <AppView>
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
        <ServerUrlSettingsView />
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
