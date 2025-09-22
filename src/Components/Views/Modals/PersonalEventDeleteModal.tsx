import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useFezDeleteMutation} from '#src/Queries/Fez/FezMutations';
import {FezData} from '#src/Structs/ControllerStructs';
import {useAppTheme} from '#src/Styles/Theme';

const ModalContent = () => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.marginBottomSmall]}>You sure? There is no undo.</Text>;
};

interface PersonalEventDeleteModalProps {
  personalEvent: FezData;
  handleNavigation?: boolean;
}

export const PersonalEventDeleteModal = ({personalEvent, handleNavigation = true}: PersonalEventDeleteModalProps) => {
  const {setSnackbarPayload} = useSnackbar();
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const deleteMutation = useFezDeleteMutation();
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const onSubmit = () => {
    deleteMutation.mutate(
      {
        fezID: personalEvent.fezID,
      },
      {
        onSuccess: async () => {
          if (handleNavigation) {
            navigation.goBack();
          }
          setModalVisible(false);
          setSnackbarPayload({message: 'Successfully deleted this event.', messageType: 'info'});
          const invalidations = FezData.getCacheKeys()
            .map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            })
            .concat([queryClient.invalidateQueries({queryKey: ['/notification/global']})]);
          await Promise.all(invalidations);
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
      <ModalCard title={'Delete'} closeButtonText={'Close'} content={<ModalContent />} actions={cardActions} />
    </View>
  );
};
