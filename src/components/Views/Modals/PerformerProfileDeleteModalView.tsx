import {useModal} from '../../Context/Contexts/ModalContext';
import {useAppTheme} from '../../../styles/Theme';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {View} from 'react-native';
import {ModalCard} from '../../Cards/ModalCard';
import React from 'react';
import {EventData, PerformerData} from '../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useQueryClient} from '@tanstack/react-query';
import {usePerformerDeleteMutation} from '../../Queries/Performer/PerformerMutations.ts';

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
