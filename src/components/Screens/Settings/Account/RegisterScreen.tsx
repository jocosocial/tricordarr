import React, {useCallback} from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {LoginFormValues, UserRegistrationFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useUserCreateQuery} from '../../../Queries/User/UserQueries';
import {useLoginQuery} from '../../../Queries/Auth/LoginQueries';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {UserCreateForm} from '../../../Forms/UserCreateForm';
import {useModal} from '../../../Context/Contexts/ModalContext';
import {UserRecoveryKeyModalView} from '../../../Views/Modals/UserRecoveryKeyModalView';
import {Text} from 'react-native-paper';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {useNavigation} from '@react-navigation/native';

export const RegisterScreen = () => {
  const createMutation = useUserCreateQuery();
  const loginMutation = useLoginQuery();
  const {signIn} = useAuth();
  const {setModalContent, setModalVisible, setModalOnDismiss} = useModal();
  const {setErrorMessage} = useErrorHandler();
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const onDismiss = useCallback(() => {
    onPress();
    navigation.goBack();
  }, [navigation, onPress]);

  const onSubmit = useCallback(
    (formValues: UserRegistrationFormValues, formikHelpers: FormikHelpers<UserRegistrationFormValues>) => {
      createMutation.mutate(formValues, {
        onSuccess: userCreateResponse => {
          const loginValues: LoginFormValues = {
            username: formValues.username,
            password: formValues.password,
          };
          loginMutation.mutate(loginValues, {
            onSuccess: response => {
              signIn(response.data).then(() => {
                setModalOnDismiss(onDismiss);
                setModalContent(
                  <UserRecoveryKeyModalView onPress={onPress} userRecoveryKey={userCreateResponse.data.recoveryKey} />,
                );
                setModalVisible(true);
              });
            },
            onSettled: () => formikHelpers.setSubmitting(false),
          });
        },
        onError: error => {
          formikHelpers.setSubmitting(false);
          setErrorMessage(error.response?.data.reason || error);
        },
      });
    },
    [
      createMutation,
      loginMutation,
      onPress,
      setErrorMessage,
      setModalContent,
      setModalOnDismiss,
      setModalVisible,
      signIn,
    ],
  );

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
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
