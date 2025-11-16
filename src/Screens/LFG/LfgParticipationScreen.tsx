import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {FezParticipantAddItem} from '#src/Components/Lists/Items/FezParticipantAddItem';
import {FezParticipantListItem} from '#src/Components/Lists/Items/FezParticipantListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LfgLeaveModal} from '#src/Components/Views/Modals/LfgLeaveModal';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezMembershipMutation} from '#src/Queries/Fez/FezMembershipQueries';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgParticipationScreen>;

export const LfgParticipationScreen = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useFezQuery({
    fezID: route.params.fezID,
  });
  const lfg = data?.pages[0];
  const [refreshing, setRefreshing] = useState(false);
  const participantMutation = useFezParticipantMutation();
  const {data: profilePublicData} = useUserProfileQuery();
  const {setModalContent, setModalVisible} = useModal();
  const membershipMutation = useFezMembershipMutation();
  const queryClient = useQueryClient();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const onParticipantRemove = (fezData: FezData, userID: string) => {
    // Call the join/unjoin if you are working on yourself.
    if (userID === profilePublicData?.header.userID) {
      setModalContent(<LfgLeaveModal fezData={fezData} />);
      setModalVisible(true);
      return;
    }
    // Call the add/remove if you are working on others.
    setRefreshing(true);
    participantMutation.mutate(
      {
        action: 'remove',
        fezID: fezData.fezID,
        userID: userID,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({queryKey: [`/fez/${fezData.fezID}`]});
        },
        onSettled: () => setRefreshing(false),
      },
    );
  };

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons left>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.lfgHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation],
  );

  const handleJoin = useCallback(() => {
    if (!lfg || !profilePublicData) {
      return;
    }
    if (FezData.isParticipant(lfg, profilePublicData.header)) {
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
            await queryClient.invalidateQueries({queryKey: [`/fez/${lfg.fezID}`]});
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [lfg, membershipMutation, profilePublicData, queryClient, setModalContent, setModalVisible]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!lfg || !lfg.members) {
    return <LoadingView />;
  }

  const manageUsers = lfg.owner.userID === profilePublicData?.header.userID;
  const isFull = FezData.isFull(lfg);
  const isUnlimited = lfg.maxParticipants === 0;
  const isMember = FezData.isParticipant(lfg, profilePublicData?.header);
  const isWaitlist = FezData.isWaitlist(lfg, profilePublicData?.header);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} />}>
        <DataFieldListItem title={'Title'} description={lfg.title} />
        <DataFieldListItem title={'Hosted By'} />
        <FezParticipantListItem
          onPress={() =>
            navigation.push(CommonStackComponents.userProfileScreen, {
              userID: lfg.owner.userID,
            })
          }
          user={lfg.owner}
          fez={lfg}
        />
        {FezType.isLFGType(lfg.fezType) && (
          <>
            <DataFieldListItem title={'Minimum Needed'} description={lfg.minParticipants} />
            <DataFieldListItem
              title={'Maximum Allowed'}
              description={lfg.maxParticipants === 0 ? 'Unlimited' : lfg.maxParticipants}
            />
          </>
        )}
        <DataFieldListItem title={`Participants (${lfg.participantCount})`} />
        <PaddedContentView padSides={false}>
          <ListSection>
            {manageUsers && !isFull && (
              <FezParticipantAddItem
                onPress={() => navigation.push(CommonStackComponents.lfgAddParticipantScreen, {fezID: lfg.fezID})}
              />
            )}
            {!isMember && !isFull && <FezParticipantAddItem onPress={handleJoin} title={'Join this LFG'} />}
            {lfg.members.participants.map(u => (
              <FezParticipantListItem
                onRemove={() => onParticipantRemove(lfg, u.userID)}
                key={u.userID}
                user={u}
                fez={lfg}
                onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: u.userID})}
              />
            ))}
          </ListSection>
        </PaddedContentView>
        {isFull && !isUnlimited && (
          <>
            <DataFieldListItem title={`Waitlist (${lfg.members.waitingList.length})`} />
            <PaddedContentView padSides={false}>
              <ListSection>
                {manageUsers && (
                  <FezParticipantAddItem
                    onPress={() => navigation.push(CommonStackComponents.lfgAddParticipantScreen, {fezID: lfg.fezID})}
                  />
                )}
                {!isMember && !isWaitlist && isFull && (
                  <FezParticipantAddItem onPress={handleJoin} title={'Join this LFG'} />
                )}
                {lfg.members.waitingList.map(u => (
                  <FezParticipantListItem
                    onRemove={() => onParticipantRemove(lfg, u.userID)}
                    key={u.userID}
                    user={u}
                    fez={lfg}
                    onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: u.userID})}
                  />
                ))}
              </ListSection>
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
