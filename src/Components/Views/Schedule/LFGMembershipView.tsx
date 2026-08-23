import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {useFezAlert} from '#src/Hooks/Fez/useFezAlert';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezData} from '#src/Hooks/useFezData';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {LfgStackComponents} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {useFezMembershipMutation} from '#src/Queries/Fez/FezMembershipQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface LFGMembershipViewProps {
  lfg: FezData;
}

export const LFGMembershipView = ({lfg}: LFGMembershipViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {currentUserID} = useSession();
  const {isParticipant, isWaitlist, isFull} = useFezData({fezID: lfg.fezID});
  const {updateMembership} = useFezCacheReducer();
  const {confirmLeave} = useFezAlert(lfg);
  const [refreshing, setRefreshing] = useState(false);
  const membershipMutation = useFezMembershipMutation();
  const dispatchScrollToTop = useScrollToTopIntent();

  const handleMembershipPress = useCallback(() => {
    if (!lfg || !currentUserID) {
      return;
    }
    if (isParticipant || isWaitlist) {
      confirmLeave();
    } else {
      setRefreshing(true);
      membershipMutation.mutate(
        {
          fezID: lfg.fezID,
          action: 'join',
        },
        {
          onSuccess: response => {
            updateMembership(lfg.fezID, response.data, 'join');
            dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
          },
          onSettled: () => {
            setRefreshing(false);
          },
        },
      );
    }
  }, [
    lfg,
    membershipMutation,
    currentUserID,
    updateMembership,
    confirmLeave,
    dispatchScrollToTop,
    isParticipant,
    isWaitlist,
    setRefreshing,
  ]);

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
          {(isParticipant || isWaitlist) && (
            <PrimaryActionButton
              testID={'lfgLeave-button'}
              buttonText={isWaitlist ? 'Leave the waitlist' : `Leave this ${lfgNoun}`}
              onPress={handleMembershipPress}
              buttonColor={theme.colors.twitarrNegativeButton}
              isLoading={refreshing}
            />
          )}
          {!isParticipant && !isWaitlist && FezType.isLFGType(lfg.fezType) && (
            <PrimaryActionButton
              testID={'lfgJoin-button'}
              buttonText={isFull ? 'Join the waitlist' : 'Join this LFG'}
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
