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

type Props = NativeStackScreenProps<
  OobeStackParamList,
  OobeStackComponents.oobeNotificationsScreen,
  NavigatorIDs.oobeStack
>;

export const OobeNotificationsScreen = ({navigation}: Props) => {
  const [permissionStatus, setPermissionStatus] = useState('');

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
    } else {
      return 'Unknown';
    }
  };

  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView>
          <Text>
            This app can send you certain push notifications (assuming fair WiFi conditions). Would you like to enable
            this? You can always change or make up your mind later.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton buttonText={buttonLabel()} onPress={enablePermissions} disabled={disableButton} />
        </PaddedContentView>
        <PaddedContentView>
          {permissionStatus === RESULTS.GRANTED && (
            <Text>Cool!</Text>
          )}
          {permissionStatus === RESULTS.BLOCKED && (
            <Text>No problem! You can always change your mind in the app settings.</Text>
          )}
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightText={'Next'}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeFinishScreen)}
      />
    </AppView>
  );
};
