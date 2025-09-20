import React from 'react';
import {View} from 'react-native';
import {UserHeader} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {ModalCard} from '../../Cards/ModalCard.tsx';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {ModeratorBlockText, UserBlockText} from '../../Text/UserRelationsText.tsx';
import {useUserBlockMutation} from '../../Queries/Users/UserBlockMutations.ts';
import {useQueryClient} from '@tanstack/react-query';

interface BlockUserModalViewProps {
  user: UserHeader;
}

const BlockUserModalContent = () => {
  const {hasModerator} = usePrivilege();
  return (
    <>
      <UserBlockText />
      {hasModerator && <ModeratorBlockText />}
    </>
  );
};

export const BlockUserModalView = ({user}: BlockUserModalViewProps) => {
  const blockMutation = useUserBlockMutation();
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const queryClient = useQueryClient();

  const onSubmit = () => {
    blockMutation.mutate(
      {
        userID: user.userID,
        action: 'block',
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
      buttonText={'Block'}
      onPress={onSubmit}
      isLoading={blockMutation.isLoading}
      disabled={blockMutation.isLoading}
    />
  );

  return (
    <View>
      <ModalCard title={'Block'} closeButtonText={'Cancel'} content={<BlockUserModalContent />} actions={cardActions} />
    </View>
  );
};
