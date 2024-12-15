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
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {useQueryClient} from '@tanstack/react-query';
import {FezType} from '../../../libraries/Enums/FezType.ts';

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
  const {setLfg, dispatchLfgList} = useTwitarr();
  const queryClient = useQueryClient();

  const onSubmit = () => {
    membershipMutation.mutate(
      {
        fezID: fezData.fezID,
        action: 'unjoin',
      },
      {
        onSuccess: async response => {
          setLfg(response.data);
          setModalVisible(false);
          dispatchLfgList({
            type: FezListActions.updateFez,
            fez: response.data,
          });
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
