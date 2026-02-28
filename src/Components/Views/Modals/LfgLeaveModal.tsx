import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useFezMembershipMutation} from '#src/Queries/Fez/FezMembershipQueries';
import {FezData} from '#src/Structs/ControllerStructs';

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
  const {theme} = useAppTheme();
  const membershipMutation = useFezMembershipMutation();
  const {updateMembership} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();

  const onSubmit = () => {
    membershipMutation.mutate(
      {
        fezID: fezData.fezID,
        action: 'unjoin',
      },
      {
        onSuccess: response => {
          setModalVisible(false);
          updateMembership(fezData.fezID, response.data, 'unjoin');
          dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
        },
      },
    );
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Leave'}
      onPress={onSubmit}
      isLoading={membershipMutation.isPending}
      disabled={membershipMutation.isPending}
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
