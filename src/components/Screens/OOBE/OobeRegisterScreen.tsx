import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {commonStyles} from '../../../styles';
import {LoginForm} from '../../Forms/LoginForm';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {LoginFormValues, UserRegistrationFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import NetInfo from '@react-native-community/netinfo';
import {useUserCreateQuery} from '../../Queries/User/UserQueries';
import {useLoginQuery} from '../../Queries/Auth/LoginQueries';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {UserCreateForm} from '../../Forms/UserCreateForm';
import {UserCreateData} from '../../../libraries/Structs/ControllerStructs';
import {useModal} from '../../Context/Contexts/ModalContext';
import {UserRecoveryKeyModalView} from '../../Views/Modals/UserRecoveryKeyModalView';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeRegisterScreen, NavigatorIDs.oobeStack>;

export const OobeRegisterScreen = ({navigation}: Props) => {
  const createMutation = useUserCreateQuery();
  const loginMutation = useLoginQuery();
  const {signIn} = useAuth();
  const {setModalContent, setModalVisible} = useModal();

  const onSubmit = useCallback(
    (formValues: UserRegistrationFormValues, formikHelpers: FormikHelpers<UserRegistrationFormValues>) => {
      createMutation.mutate(formValues, {
        onSuccess: userCreateResponse => {
          setModalContent(<UserRecoveryKeyModalView userRecoveryKey={userCreateResponse.data.recoveryKey} />);
          setModalVisible(true);
          const loginValues: LoginFormValues = {
            username: formValues.username,
            password: formValues.password,
          };
          loginMutation.mutate(loginValues, {
            onSuccess: response => {
              signIn(response.data).then(() => {
                // Triggering NetInfo here can tell the other providers
                // that we may need to start the Foreground Service Worker.
                NetInfo.refresh();
              });
            },
            onSettled: () => formikHelpers.setSubmitting(false),
          });
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      });
    },
    [createMutation, loginMutation, setModalContent, setModalVisible, signIn],
  );

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <UserCreateForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
