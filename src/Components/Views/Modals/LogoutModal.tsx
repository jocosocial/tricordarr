import {useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {stopForegroundServiceWorker} from '#src/Libraries/Notifications/Push/Android/ForegroundService';
import {useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';
import {useLogoutMutation} from '#src/Queries/Auth/LogoutMutations';
import {WebSocketStorageActions} from '#src/Reducers/Fez/FezSocketReducer';

interface LogoutModalContentProps {
  allDevices: boolean;
}

const LogoutModalContent = ({allDevices = false}: LogoutModalContentProps) => {
  const {commonStyles} = useStyles();
  return (
    <>
      {allDevices && <Text style={[commonStyles.marginBottomSmall]}>Confirm log out all of your devices?</Text>}
      {!allDevices && <Text style={[commonStyles.marginBottomSmall]}>Confirm log out this device?</Text>}
    </>
  );
};

export const LogoutDeviceModalView = ({allDevices = false}: LogoutModalContentProps) => {
  const {setModalVisible} = useModal();
  const {theme} = useAppTheme();
  const settingsNavigation = useSettingsStack();

  const {setEnableUserNotifications} = useEnableUserNotification();
  const {signOut} = useAuth();
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      onLogout();
    },
  });
  const {closeNotificationSocket, dispatchFezSockets} = useSocket();
  const [loading, setLoading] = useState(false);
  const {clearPrivileges} = usePrivilege();
  const queryClient = useQueryClient();
  const {preRegistrationMode} = usePreRegistration();

  const onLogout = () => {
    setEnableUserNotifications(false);
    closeNotificationSocket();
    dispatchFezSockets({
      type: WebSocketStorageActions.clear,
    });
    stopForegroundServiceWorker().then(() =>
      signOut(preRegistrationMode).then(() => {
        clearPrivileges();
        queryClient.clear();
        setModalVisible(false);
        setLoading(false);
        settingsNavigation.goBack();
      }),
    );
  };

  const logoutDevice = () => {
    setLoading(true);
    onLogout();
  };

  const logoutAll = () => {
    setLoading(true);
    logoutMutation.mutate();
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Log Out'}
      onPress={allDevices ? logoutAll : logoutDevice}
      isLoading={logoutMutation.isPending || loading}
      disabled={logoutMutation.isPending || loading}
    />
  );

  return (
    <View>
      <ModalCard
        title={'Log Out'}
        closeButtonText={'Cancel'}
        content={<LogoutModalContent allDevices={allDevices} />}
        actions={cardActions}
      />
    </View>
  );
};
