import {useModal} from '#src/Context/Contexts/ModalContext';
import {useAppTheme} from '#src/Styles/Theme';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {View} from 'react-native';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import React from 'react';
import {FezData} from '#src/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useFezMembershipMutation} from '#src/Queries/Fez/FezMembershipQueries';
import {useQueryClient} from '@tanstack/react-query';
import {FezType} from '#src/Enums/FezType';

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
