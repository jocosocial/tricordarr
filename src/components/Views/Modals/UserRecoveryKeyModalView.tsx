import React from 'react';
import {View} from 'react-native';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {ModalCard} from '../../Cards/ModalCard';
import {useModal} from '../../Context/Contexts/ModalContext';
import {useUserMuteMutation} from '../../Queries/Users/UserMuteQueries';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ModeratorMuteText, UserMuteText} from '../../Text/UserRelationsText';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface UserRecoveryKeyModalViewProps {
  userRecoveryKey: string;
}

const UserRecoveryKeyModalContent = ({recoveryKey}: {recoveryKey: string}) => {
  return (
    <>
      <Text>
        Your account recovery key can be used if you lose access to your account and can't recover your password. It can
        be used only once and will be shown to you only right now. Write it down or screenshot this screen before
        proceeding.
      </Text>
      <Text>{recoveryKey}</Text>
    </>
  );
};

export const UserRecoveryKeyModalView = ({userRecoveryKey}: UserRecoveryKeyModalViewProps) => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const {setModalVisible} = useModal();

  const onPress = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrPositiveButton}
      buttonText={'Acknowledged'}
      onPress={onPress}
    />
  );
  return (
    <View>
      <ModalCard
        title={'Recovery Key'}
        closeButtonText={'Close'}
        content={<UserRecoveryKeyModalContent recoveryKey={userRecoveryKey} />}
        actions={cardActions}
      />
    </View>
  );
};
