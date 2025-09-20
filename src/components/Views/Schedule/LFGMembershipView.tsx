import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView.tsx';
import {FezData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import {View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {useAppTheme} from '#src/Styles/Theme.ts';
import {LfgLeaveModal} from '#src/Components/Views/Modals/LfgLeaveModal.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {useModal} from '#src/Components/Context/Contexts/ModalContext.ts';
import {useFezMembershipMutation} from '#src/Components/Queries/Fez/FezMembershipQueries.ts';
import {StyleSheet} from 'react-native';
import {FezType} from '#src/Libraries/Enums/FezType.ts';
import {useUserProfileQuery} from '#src/Components/Queries/User/UserQueries.ts';

interface LFGMembershipViewProps {
  lfg: FezData;
}

export const LFGMembershipView = ({lfg}: LFGMembershipViewProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const {data: profilePublicData} = useUserProfileQuery();
  const queryClient = useQueryClient();
  const {setModalVisible, setModalContent} = useModal();
  const [refreshing, setRefreshing] = useState(false);
  const membershipMutation = useFezMembershipMutation();

  const handleMembershipPress = useCallback(() => {
    if (!lfg || !profilePublicData) {
      return;
    }
    if (FezData.isParticipant(lfg, profilePublicData.header) || FezData.isWaitlist(lfg, profilePublicData.header)) {
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
          onSuccess: async () => {
            const invalidations = FezData.getCacheKeys(lfg.fezID).map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setRefreshing(false);
          },
        },
      );
    }
  }, [lfg, membershipMutation, profilePublicData, queryClient, setModalContent, setModalVisible]);

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
      {profilePublicData && lfg.owner.userID !== profilePublicData.header.userID && (
        <PaddedContentView>
          {(FezData.isParticipant(lfg, profilePublicData?.header) ||
            FezData.isWaitlist(lfg, profilePublicData?.header)) && (
            <PrimaryActionButton
              buttonText={
                FezData.isWaitlist(lfg, profilePublicData.header) ? 'Leave the waitlist' : `Leave this ${lfgNoun}`
              }
              onPress={handleMembershipPress}
              buttonColor={theme.colors.twitarrNegativeButton}
              isLoading={refreshing}
            />
          )}
          {!FezData.isParticipant(lfg, profilePublicData?.header) &&
            !FezData.isWaitlist(lfg, profilePublicData?.header) && (
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
