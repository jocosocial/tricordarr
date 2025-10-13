import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Text} from 'react-native-paper';
import {requestNotifications, RESULTS} from 'react-native-permissions';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {BatteryOptimizationSettingsView} from '#src/Components/Views/Settings/BatteryOptimizationSettingsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobePermissionsScreen>;

export const OobePermissionsScreen = ({navigation}: Props) => {
  const {commonStyles} = useStyles();
  const {setHasNotificationPermission, notificationPermissionStatus, setNotificationPermissionStatus} = useConfig();

  const enablePermissions = async () => {
    const {status} = await requestNotifications([]);
    setHasNotificationPermission(status === RESULTS.GRANTED);
    setNotificationPermissionStatus(status);
  };

  const disableButton = notificationPermissionStatus !== RESULTS.DENIED;

  const buttonLabel = () => {
    if (notificationPermissionStatus === RESULTS.BLOCKED) {
      return 'Blocked';
    } else if (notificationPermissionStatus === RESULTS.DENIED) {
      return 'Enable';
    } else if (notificationPermissionStatus === RESULTS.GRANTED) {
      return 'Already Enabled';
    } else if (notificationPermissionStatus === RESULTS.UNAVAILABLE) {
      return 'Unavailable';
    } else {
      return 'Unknown';
    }
  };

  return (
    <AppView safeEdges={['bottom']}>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Notifications</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottomSmall}>
            This app can send you certain push notifications (assuming fair WiFi conditions). Would you like to enable
            this? You can always change or make up your mind later.
          </Text>
          <Text style={commonStyles.marginBottomSmall}>
            Example notifications include: chat messages, forum mentions, alert keywords, event reminders.
          </Text>
          <Text style={commonStyles.marginBottomSmall}>
            Enabling this setting will make this app consume more battery.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton buttonText={buttonLabel()} onPress={enablePermissions} disabled={disableButton} />
        </PaddedContentView>
        <PaddedContentView>
          {notificationPermissionStatus === RESULTS.GRANTED && (
            <Text>Cool! You can pick exactly which kinds of notifications you want in the app settings.</Text>
          )}
          {notificationPermissionStatus === RESULTS.BLOCKED && (
            <Text>No problem! You can always change your mind in the app settings.</Text>
          )}
          {notificationPermissionStatus === RESULTS.UNAVAILABLE && (
            <Text>
              Unavailable usually means your device does not require permission to send notifications. You can pick
              exactly which kinds of notifications you want in the app settings.
            </Text>
          )}
        </PaddedContentView>
        {notificationPermissionStatus === RESULTS.GRANTED && <BatteryOptimizationSettingsView />}
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightText={'Next'}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeUserDataScreen)}
      />
    </AppView>
  );
};
