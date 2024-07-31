import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useModal} from '../../Context/Contexts/ModalContext';
import {useAppTheme} from '../../../styles/Theme';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {View} from 'react-native';
import {ModalCard} from '../../Cards/ModalCard';
import React from 'react';
import {PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useQueryClient} from '@tanstack/react-query';
import {usePersonalEventDeleteMutation} from '../../Queries/PersonalEvent/PersonalEventMutations.tsx';
import {useNavigation} from '@react-navigation/native';

const ModalContent = () => {
  const {commonStyles} = useStyles();
  return <Text style={[commonStyles.marginBottomSmall]}>You sure? There is no undo.</Text>;
};

export const PersonalEventDeleteModal = ({personalEvent}: {personalEvent: PersonalEventData}) => {
  const {setInfoMessage} = useErrorHandler();
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const deleteMutation = usePersonalEventDeleteMutation();
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const onSubmit = () => {
    deleteMutation.mutate(
      {
        personalEventID: personalEvent.personalEventID,
      },
      {
        onSuccess: async () => {
          navigation.goBack();
          setModalVisible(false);
          setInfoMessage('Successfully deleted this event.');
          await queryClient.invalidateQueries(['/personalevents']);
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
