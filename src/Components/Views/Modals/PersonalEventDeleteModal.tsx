import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezDeleteMutation} from '#src/Queries/Fez/FezMutations';
import {FezData} from '#src/Structs/ControllerStructs';

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
  const {theme} = useAppTheme();
  const deleteMutation = useFezDeleteMutation();
  const {deleteFez} = useFezCacheReducer();
  const navigation = useNavigation();

  const onSubmit = () => {
    deleteMutation.mutate(
      {
        fezID: personalEvent.fezID,
      },
      {
        onSuccess: () => {
          if (handleNavigation) {
            navigation.goBack();
          }
          setModalVisible(false);
          setSnackbarPayload({message: 'Successfully deleted this event.', messageType: 'info'});
          deleteFez(personalEvent.fezID);
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Delete'}
      onPress={onSubmit}
      isLoading={deleteMutation.isPending}
      disabled={deleteMutation.isPending}
    />
  );

  return (
    <View>
      <ModalCard title={'Delete'} closeButtonText={'Close'} content={<ModalContent />} actions={cardActions} />
    </View>
  );
};
