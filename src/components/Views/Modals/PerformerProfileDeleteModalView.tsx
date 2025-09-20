import {useModal} from '#src/Context/Contexts/ModalContext';
import {useAppTheme} from '#src/Styles/Theme';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {View} from 'react-native';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import React from 'react';
import {EventData, PerformerData} from '#src/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useQueryClient} from '@tanstack/react-query';
import {usePerformerDeleteMutation} from '#src/Queries/Performer/PerformerMutations';

const ModalContent = () => {
  const {commonStyles} = useStyles();
  return (
    <>
      <Text style={[commonStyles.marginBottomSmall]}>
        Deleting your performer profile deletes it for all events. There is no recovery. Confirm?
      </Text>
    </>
  );
};

export const PerformerProfileDeleteModalView = () => {
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const deleteMutation = usePerformerDeleteMutation();
  const queryClient = useQueryClient();

  const onSubmit = () => {
    deleteMutation.mutate(
      {},
      {
        onSuccess: async () => {
          const invalidations = PerformerData.getCacheKeys()
            .map(key => {
              return queryClient.invalidateQueries(key);
            })
            .concat(
              EventData.getCacheKeys().map(key => {
                return queryClient.invalidateQueries(key);
              }),
            );
          await Promise.all(invalidations);
          setModalVisible(false);
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Delete'}
      onPress={onSubmit}
      isLoading={deleteMutation.isLoading}
      disabled={deleteMutation.isLoading}
    />
  );

  return (
    <View>
      <ModalCard title={'Delete Profile'} closeButtonText={'Close'} content={<ModalContent />} actions={cardActions} />
    </View>
  );
};
