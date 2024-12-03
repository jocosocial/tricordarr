import React from 'react';
import {View} from 'react-native';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {ModalCard} from '../../Cards/ModalCard';
import {useModal} from '../../Context/Contexts/ModalContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ModeratorMuteText, UserMuteText} from '../../Text/UserRelationsText';
import {useUserMuteMutation} from '../../Queries/Users/UserMuteMutations.ts';

interface MuteUserModalViewProps {
  user: UserHeader;
}

const MuteUserModalContent = () => {
  const {hasModerator} = usePrivilege();
  return (
    <>
      <UserMuteText />
      {hasModerator && <ModeratorMuteText />}
    </>
  );
};

export const MuteUserModalView = ({user}: MuteUserModalViewProps) => {
  const muteMutation = useUserMuteMutation();
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const {mutes, setMutes} = useUserRelations();

  const onSubmit = () => {
    muteMutation.mutate(
      {
        userID: user.userID,
        action: 'mute',
      },
      {
        onSuccess: () => {
          setMutes(mutes.concat([user]));
          setModalVisible(false);
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Mute'}
      onPress={onSubmit}
      isLoading={muteMutation.isLoading}
      disabled={muteMutation.isLoading}
    />
  );

  return (
    <View>
      <ModalCard title={'Mute'} closeButtonText={'Cancel'} content={<MuteUserModalContent />} actions={cardActions} />
    </View>
  );
};
