import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {TitleTag} from '../../Text/Tags/TitleTag.tsx';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {ListSection} from '../../Lists/ListSection.tsx';
import {FezParticipantListItem} from '../../Lists/Items/FezParticipantListItem.tsx';
import {useFezQuery} from '../../Queries/Fez/FezQueries.ts';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/FezManagementUserMutations.ts';
import {FezParticipantAddItem} from '../../Lists/Items/FezParticipantAddItem.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {LfgLeaveModal} from '../../Views/Modals/LfgLeaveModal.tsx';
import {useFezMembershipMutation} from '../../Queries/Fez/FezMembershipQueries.ts';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.lfgParticipationScreen>;

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
          await queryClient.invalidateQueries([`/fez/${fezData.fezID}`]);
        },
        onSettled: () => setRefreshing(false),
      },
    );
  };

  const getNavButtons = useCallback(
    () => (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.lfgHelpScreen)}
          />
        </HeaderButtons>
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
            await queryClient.invalidateQueries([`/fez/${lfg.fezID}`]);
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
            <PaddedContentView padBottom={false}>
              <TitleTag>Waitlist ({lfg.members.waitingList.length})</TitleTag>
            </PaddedContentView>
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
