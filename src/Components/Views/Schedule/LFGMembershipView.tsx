import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {LfgLeaveModal} from '#src/Components/Views/Modals/LfgLeaveModal';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useFezMembershipMutation} from '#src/Queries/Fez/FezMembershipQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface LFGMembershipViewProps {
  lfg: FezData;
}

export const LFGMembershipView = ({lfg}: LFGMembershipViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {currentUserID} = useSession();
  const {updateMembership} = useFezCacheReducer();
  const {setModalVisible, setModalContent} = useModal();
  const [refreshing, setRefreshing] = useState(false);
  const membershipMutation = useFezMembershipMutation();
  const dispatchScrollToTop = useScrollToTopIntent();

  const handleMembershipPress = useCallback(() => {
    if (!lfg || !currentUserID) {
      return;
    }
    if (FezData.isParticipant(lfg, currentUserID) || FezData.isWaitlist(lfg, currentUserID)) {
      setModalContent(<LfgLeaveModal fezData={lfg} />);
      setModalVisible(true);
    } else {
      setRefreshing(true);
      membershipMutation.mutate(
        {
          fezID: lfg.fezID,
          action: 'join',
        },
        {
          onSuccess: response => {
            updateMembership(lfg.fezID, response.data);
            dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
          },
          onSettled: () => {
            setRefreshing(false);
          },
        },
      );
    }
  }, [lfg, membershipMutation, currentUserID, updateMembership, setModalContent, setModalVisible, dispatchScrollToTop]);

  const styles = StyleSheet.create({
    outerContainer: {
      ...commonStyles.displayFlex,
      ...commonStyles.flexRow,
      ...commonStyles.marginTopSmall,
    },
  });

  const lfgNoun = FezType.isPrivateEventType(lfg.fezType) ? 'Private Event' : 'LFG';

  return (
    <View style={styles.outerContainer}>
      {currentUserID != null && lfg.owner.userID !== currentUserID && (
        <PaddedContentView>
          {(FezData.isParticipant(lfg, currentUserID) || FezData.isWaitlist(lfg, currentUserID)) && (
            <PrimaryActionButton
              buttonText={FezData.isWaitlist(lfg, currentUserID) ? 'Leave the waitlist' : `Leave this ${lfgNoun}`}
              onPress={handleMembershipPress}
              buttonColor={theme.colors.twitarrNegativeButton}
              isLoading={refreshing}
            />
          )}
          {!FezData.isParticipant(lfg, currentUserID) && !FezData.isWaitlist(lfg, currentUserID) && (
            <PrimaryActionButton
              buttonText={FezData.isFull(lfg) ? 'Join the waitlist' : 'Join this LFG'}
              onPress={handleMembershipPress}
              buttonColor={theme.colors.twitarrPositiveButton}
              isLoading={refreshing}
            />
          )}
        </PaddedContentView>
      )}
    </View>
  );
};
