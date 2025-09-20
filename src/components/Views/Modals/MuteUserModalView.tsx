import React from 'react';
import {View} from 'react-native';
import {UserHeader} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {ModalCard} from '../../Cards/ModalCard.tsx';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {ModeratorMuteText, UserMuteText} from '../../Text/UserRelationsText.tsx';
import {useUserMuteMutation} from '../../Queries/Users/UserMuteMutations.ts';
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
