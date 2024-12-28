import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useModal} from '../../Context/Contexts/ModalContext';
import {useAppTheme} from '../../../styles/Theme';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {View} from 'react-native';
import {ModalCard} from '../../Cards/ModalCard';
import React from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {useFezDeleteMutation} from '../../Queries/Fez/FezMutations.ts';

const ModalContent = () => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.marginBottomSmall]}>You sure? There is no undo.</Text>;
};

interface PersonalEventDeleteModalProps {
  personalEvent: FezData;
  handleNavigation?: boolean;
}

export const PersonalEventDeleteModal = ({personalEvent, handleNavigation = true}: PersonalEventDeleteModalProps) => {
  const {setInfoMessage} = useErrorHandler();
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
          setInfoMessage('Successfully deleted this event.');
          const invalidations = FezData.getCacheKeys().map(key => {
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
