import React, {useCallback, useState} from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {LoginFormValues, UserRegistrationFormValues} from '../../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {useLoginMutation} from '../../../Queries/Auth/LoginMutations.ts';
import {useAuth} from '../../../Context/Contexts/AuthContext.ts';
import {UserCreateForm} from '../../../Forms/User/UserCreateForm.tsx';
import {useModal} from '../../../Context/Contexts/ModalContext.ts';
import {UserRecoveryKeyModalView} from '../../../Views/Modals/UserRecoveryKeyModalView.tsx';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {RefreshControl} from 'react-native';
import {useUserCreateQuery} from '../../../Queries/User/UserMutations.ts';
import {useConfig} from '../../../Context/Contexts/ConfigContext.ts';

const RegisterScreenBase = () => {
  const createMutation = useUserCreateQuery();
  const loginMutation = useLoginMutation();
  const {signIn} = useAuth();
  const {setModalContent, setModalVisible, setModalOnDismiss} = useModal();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const {preRegistrationMode} = useConfig();

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
    <ScrollingContentView isStack={true} refreshControl={<RefreshControl enabled={false} refreshing={refreshing} />}>
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

export const RegisterScreen = () => {
  return (
    <AppView>
      <RegisterScreenBase />
    </AppView>
  );
};

export const OobeRegisterScreen = () => {
  return (
    <AppView safeEdges={['bottom']}>
      <RegisterScreenBase />
    </AppView>
  );
};
