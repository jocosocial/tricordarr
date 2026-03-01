import {useNavigation} from '@react-navigation/native';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserCreateForm} from '#src/Components/Forms/User/UserCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {UserRecoveryKeyModalView} from '#src/Components/Views/Modals/UserRecoveryKeyModalView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {useLoginMutation} from '#src/Queries/Auth/LoginMutations';
import {useUserCreateQuery} from '#src/Queries/User/UserMutations';
import {LoginFormValues, UserRegistrationFormValues} from '#src/Types/FormValues';

export const RegisterScreen = () => {
  const createMutation = useUserCreateQuery();
  const loginMutation = useLoginMutation();
  const {signIn} = useSession();
  const {setModalContent, setModalVisible, setModalOnDismiss} = useModal();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const {currentSession, findOrCreateSession} = useSession();
  const {appConfig} = useConfig();
  const [isSessionReady, setIsSessionReady] = useState(false);
  const {updateClientSettings} = useClientSettings();
  const {oobeCompleted} = useOobe();
  const {refetch: refetchRoles} = useRoles();
  const {signIn: signInWebview} = useTwitarrWebview();

  // Create session on mount if none exists
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentSession) {
        // Create a default session if none exists
        await findOrCreateSession(appConfig.serverUrl, false);
      }
      setIsSessionReady(true);
    };

    initializeSession();
  }, [currentSession, findOrCreateSession, appConfig.serverUrl]);

  const onPress = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const onDismiss = useCallback(() => {
    onPress();
    navigation.goBack();
  }, [navigation, onPress]);

  const onSubmit = useCallback(
    (formValues: UserRegistrationFormValues, formikHelpers: FormikHelpers<UserRegistrationFormValues>) => {
      setRefreshing(true);
      createMutation.mutate(formValues, {
        onSuccess: userCreateResponse => {
          const loginValues: LoginFormValues = {
            username: formValues.username,
            password: formValues.password,
          };
          loginMutation.mutate(loginValues, {
            onSuccess: async response => {
              setModalOnDismiss(onDismiss);
              setModalContent(
                <UserRecoveryKeyModalView onPress={onPress} userRecoveryKey={userCreateResponse.data.recoveryKey} />,
              );
              setModalVisible(true);
              signInWebview(loginValues);
              await signIn(response.data);
              if (oobeCompleted) {
                await startPushProvider();
              }
              setTimeout(async () => {
                await Promise.all([updateClientSettings(), refetchRoles()]);
              }, 1000);
            },
            onSettled: () => {
              formikHelpers.setSubmitting(false);
              setRefreshing(false);
            },
          });
        },
        onSettled: () => {
          formikHelpers.setSubmitting(false);
          setRefreshing(false);
        },
      });
    },
    [
      createMutation,
      loginMutation,
      oobeCompleted,
      onDismiss,
      onPress,
      refetchRoles,
      setModalContent,
      setModalOnDismiss,
      setModalVisible,
      signIn,
      signInWebview,
      updateClientSettings,
    ],
  );

  if (!isSessionReady) {
    return (
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <ActivityIndicator />
        </PaddedContentView>
      </ScrollingContentView>
    );
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl enabled={false} refreshing={refreshing} />}>
        <PaddedContentView padTop={true}>
          <Text>
            Your Twitarr registration code was sent to you via e-mail. If you did not receive your registration code or
            do not have access to your e-mail, go to the JoCo Cruise Info Desk for assistance.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Your registration code can only be used once. Do not share it with others. You will be held accountable for
            the actions of ANYONE using your code.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            If you need an additional code to create an additional account, please request one at the JoCo Cruise Info
            Desk.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <UserCreateForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
