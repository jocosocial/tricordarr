import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {ModeratorBlockText, UserBlockText} from '#src/Components/Text/UserRelationsText';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useUserBlockMutation} from '#src/Queries/Users/UserBlockMutations';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {useAppTheme} from '#src/Styles/Theme';

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
