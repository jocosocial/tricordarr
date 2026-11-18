import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LocalNetworkPermissionView} from '#src/Components/Views/LocalNetworkPermissionView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {ServerChoiceView} from '#src/Components/Views/ServerChoiceView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {OobeLocation} from '#src/Enums/OobeLocation';
import {useExplicitServerHealthStatus} from '#src/Hooks/useServerHealthStatus';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen>;

/**
 * Choose the server to set up and see its healthcheck. The choice is only held on this screen and
 * handed to the next step. Nothing about the active session changes until the account step, so
 * backing out leaves the app as it was.
 */
export const OobeServerScreen = ({navigation, route}: Props) => {
  const {mode, location} = route.params;
  const {currentSession} = useSession();
  const {appConfig} = useConfig();
  const {theme} = useAppTheme();
  const {hasUnsavedWork} = useErrorHandler();
  const [serverUrl, setServerUrl] = useState(
    route.params.serverUrl ?? currentSession?.serverUrl ?? appConfig.serverUrl,
  );
  const health = useExplicitServerHealthStatus(serverUrl);

  const isLand = location === OobeLocation.land;
  // Adding an account is the one case where choosing some other server is the point, so the
  // guidance is skipped there. The local network permission is needed either way.
  const header = (
    <>
      <LocalNetworkPermissionView onGranted={health.healthQuery.refetch} />
      {mode !== 'addAccount' && (
        <>
          {!isLand && (
            <PaddedContentView padTop={true}>
              <Text>
                Before proceeding ensure that your phone is on ship WiFi and you have disabled any VPNs, private DNS, or
                other network blockers.
              </Text>
            </PaddedContentView>
          )}
          <PaddedContentView padTop={isLand}>
            <Text>
              Do not change this unless instructed to do so by the Twitarr Dev Team or THO.
              {isLand ? (
                <Text> Should be set to Start during pre-registration.</Text>
              ) : (
                <Text> Should be set to Production when on-board.</Text>
              )}
            </Text>
          </PaddedContentView>
        </>
      )}
    </>
  );

  return (
    <AppView disablePreRegistrationWarning={true}>
      <ServerChoiceView serverUrl={serverUrl} onChange={setServerUrl} health={health} header={header} />
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        middleText={'Help'}
        middleOnPress={() => navigation.push(CommonStackComponents.networkHelpScreen)}
        middleIcon={AppIcons.help}
        middleButtonColor={theme.colors.twitarrNegativeButton}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeAccountScreen, {mode, serverUrl})}
        rightDisabled={!health.passed || hasUnsavedWork}
      />
    </AppView>
  );
};
