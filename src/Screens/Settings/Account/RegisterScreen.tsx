import {useNavigation} from '@react-navigation/native';
import {FormikHelpers} from 'formik';
import React, {useCallback, useState} from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {UserCreateForm} from '#src/Components/Forms/User/UserCreateForm';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {UserRecoveryKeyModalView} from '#src/Components/Views/Modals/UserRecoveryKeyModalView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useLoginMutation} from '#src/Queries/Auth/LoginMutations';
import {useUserCreateQuery} from '#src/Queries/User/UserMutations';
import {LoginFormValues, UserRegistrationFormValues} from '#src/Types/FormValues';

export const RegisterScreen = () => {
  const createMutation = useUserCreateQuery();
  const loginMutation = useLoginMutation();
  const {signIn} = useAuth();
  const {setModalContent, setModalVisible, setModalOnDismiss} = useModal();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const {preRegistrationMode} = usePreRegistration();

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
            onSuccess: response => {
              signIn(response.data, preRegistrationMode).then(() => {
                setModalOnDismiss(onDismiss);
                setModalContent(
                  <UserRecoveryKeyModalView onPress={onPress} userRecoveryKey={userCreateResponse.data.recoveryKey} />,
                );
                setModalVisible(true);
              });
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
      onDismiss,
      onPress,
      setModalContent,
      setModalOnDismiss,
      setModalVisible,
      signIn,
      preRegistrationMode,
    ],
  );

  return (
    <ScrollingContentView isStack={true} refreshControl={<AppRefreshControl enabled={false} refreshing={refreshing} />}>
      <PaddedContentView padTop={true}>
        <Text>
          Your Twitarr registration code was sent to you via e-mail. If you did not receive your registration code or do
          not have access to your e-mail, go to the JoCo Cruise Info Desk for assistance.
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
  );
};
