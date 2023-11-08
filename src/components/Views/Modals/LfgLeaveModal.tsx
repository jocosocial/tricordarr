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
import {useFezMembershipMutation} from '../../Queries/Fez/FezMembershipQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';

const ModalContent = ({fezData}: {fezData: FezData}) => {
  const {commonStyles} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      Leave group {fezData.title}? If this group has limited capacity you may not be able to re-join.
    </Text>
  );
};

export const LfgLeaveModal = ({fezData}: {fezData: FezData}) => {
  const {setErrorMessage} = useErrorHandler();
  const {setModalVisible} = useModal();
  const theme = useAppTheme();
  const membershipMutation = useFezMembershipMutation();
  const {setFez} = useTwitarr();

  const onSubmit = () => {
    membershipMutation.mutate(
      {
        fezID: fezData.fezID,
        action: 'unjoin',
      },
      {
        onSuccess: response => {
          setErrorMessage('Successfully left LFG!');
          setFez(response.data);
          setModalVisible(false);
        },
        onError: error => {
          setErrorMessage(error.response?.data.reason);
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
