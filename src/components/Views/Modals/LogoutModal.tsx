import React, {useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {ModalCard} from '#src/Components/Cards/ModalCard.tsx';
import {useModal} from '#src/Components/Context/Contexts/ModalContext.ts';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import {useAppTheme} from '#src/Styles/Theme.ts';
import {useUserNotificationData} from '#src/Components/Context/Contexts/UserNotificationDataContext.ts';
import {useAuth} from '#src/Components/Context/Contexts/AuthContext.ts';
import {useLogoutMutation} from '#src/Components/Queries/Auth/LogoutMutations.ts';
import {useSocket} from '#src/Components/Context/Contexts/SocketContext.ts';
import {useSettingsStack} from '#src/Components/Navigation/Stacks/SettingsStackNavigator.tsx';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext.ts';
import {useQueryClient} from '@tanstack/react-query';
import {stopForegroundServiceWorker} from '#src/Libraries/Service.ts';
import {WebSocketStorageActions} from '#src/Components/Reducers/Fez/FezSocketReducer.ts';
import {useConfig} from '#src/Components/Context/Contexts/ConfigContext.ts';

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
  const theme = useAppTheme();
  const settingsNavigation = useSettingsStack();

  const {setEnableUserNotifications} = useUserNotificationData();
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
  const {preRegistrationMode} = useConfig();

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
      isLoading={logoutMutation.isLoading || loading}
      disabled={logoutMutation.isLoading || loading}
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
