import React from 'react';
import {View} from 'react-native';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useAppTheme} from '#src/Styles/Theme';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {ModeratorMuteText, UserMuteText} from '#src/Components/Text/UserRelationsText';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {useQueryClient} from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  const onSubmit = () => {
    muteMutation.mutate(
      {
        userID: user.userID,
        action: 'mute',
      },
      {
        onSuccess: () => {
          const invalidations = UserHeader.getRelationKeys().map(key => {
            return queryClient.invalidateQueries(key);
          });
          Promise.all(invalidations);
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
