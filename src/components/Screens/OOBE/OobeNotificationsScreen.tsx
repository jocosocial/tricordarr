import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {check as checkPermission, PERMISSIONS, request as requestPermission, RESULTS} from 'react-native-permissions';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {BatteryOptimizationSettingsView} from '../../Views/Settings/BatteryOptimizationSettingsView';

type Props = NativeStackScreenProps<
  OobeStackParamList,
  OobeStackComponents.oobeNotificationsScreen,
  NavigatorIDs.oobeStack
>;

export const OobeNotificationsScreen = ({navigation}: Props) => {
  const [permissionStatus, setPermissionStatus] = useState('');
  const {commonStyles} = useStyles();

  const enablePermissions = () => {
    requestPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setPermissionStatus(status);
    });
  };

  useEffect(() => {
    checkPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setPermissionStatus(status);
    });
  }, []);

  const disableButton = permissionStatus !== RESULTS.DENIED;

  const buttonLabel = () => {
    if (permissionStatus === RESULTS.BLOCKED) {
      return 'Blocked';
    } else if (permissionStatus === RESULTS.DENIED) {
      return 'Enable';
    } else if (permissionStatus === RESULTS.GRANTED) {
      return 'Already Enabled';
    } else if (permissionStatus === RESULTS.UNAVAILABLE) {
      return 'Unavailable';
    } else {
      return 'Unknown';
    }
  };

  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
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
          {permissionStatus === RESULTS.GRANTED && (
            <Text>Cool! You can pick exactly which kinds of notifications you want in the app settings.</Text>
          )}
          {permissionStatus === RESULTS.BLOCKED && (
            <Text>No problem! You can always change your mind in the app settings.</Text>
          )}
          {permissionStatus === RESULTS.UNAVAILABLE && (
            <Text>
              Unavailable usually means your device does not require permission to send notifications. You can pick
              exactly which kinds of notifications you want in the app settings.
            </Text>
          )}
        </PaddedContentView>
        {permissionStatus === RESULTS.GRANTED && <BatteryOptimizationSettingsView />}
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightText={'Next'}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeFinishScreen)}
      />
    </AppView>
  );
};
