import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {View} from 'react-native';
import {ModalCard} from '../../Cards/ModalCard.tsx';
import React from 'react';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useFezMembershipMutation} from '../../Queries/Fez/FezMembershipQueries.ts';
import {useQueryClient} from '@tanstack/react-query';
import {FezType} from '../../../Libraries/Enums/FezType.ts';

const ModalContent = ({fezData}: {fezData: FezData}) => {
  const {commonStyles} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      Leave {fezData.title}?{' '}
      {FezType.isLFGType(fezData.fezType) && (
        <Text>
          If this group has limited capacity you may not be able to re-join. If you were on the wait list you'll lose
          your place in the queue.
        </Text>
      )}
    </Text>
  );
};

export const LfgLeaveModal = ({fezData}: {fezData: FezData}) => {
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const membershipMutation = useFezMembershipMutation();
  const queryClient = useQueryClient();

  const onSubmit = () => {
    membershipMutation.mutate(
      {
        fezID: fezData.fezID,
        action: 'unjoin',
      },
      {
        onSuccess: async () => {
          setModalVisible(false);
          const invalidations = FezData.getCacheKeys(fezData.fezID).map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(invalidations);
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Leave'}
      onPress={onSubmit}
      isLoading={membershipMutation.isLoading}
      disabled={membershipMutation.isLoading}
    />
  );

  return (
    <View>
      <ModalCard
        title={'Leave'}
        closeButtonText={'Cancel'}
        content={<ModalContent fezData={fezData} />}
        actions={cardActions}
      />
    </View>
  );
};
