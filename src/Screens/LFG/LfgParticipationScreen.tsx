import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
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
import {useSession} from '#src/Context/Contexts/SessionContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFez} from '#src/Hooks/useFez';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useFezMembershipMutation} from '#src/Queries/Fez/FezMembershipQueries';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgParticipationScreen>;

export const LfgParticipationScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={`/lfg/${props.route.params.fezID}`}>
        <LfgParticipationScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const LfgParticipationScreenInner = ({navigation, route}: Props) => {
  const {fezData: lfg, refetch, isFetching} = useFez({fezID: route.params.fezID});
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });
  const participantMutation = useFezParticipantMutation();
  const {currentUserID} = useSession();
  const {setModalContent, setModalVisible} = useModal();
  const membershipMutation = useFezMembershipMutation();
  const {updateMembership} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();

  const onParticipantRemove = (fezData: FezData, userID: string) => {
    // Call the join/unjoin if you are working on yourself.
    if (userID === currentUserID) {
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
        onSuccess: response => {
          updateMembership(fezData.fezID, response.data);
          dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
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
            onPress={() => navigation.push(CommonStackComponents.lfgParticipationHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation],
  );

  const handleJoin = useCallback(() => {
    if (!lfg || !currentUserID) {
      return;
    }
    if (FezData.isParticipant(lfg, currentUserID)) {
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
            updateMembership(lfg.fezID, response.data, 'join');
            dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [lfg, membershipMutation, currentUserID, updateMembership, setModalContent, setModalVisible, dispatchScrollToTop, setRefreshing]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!lfg || !lfg.members) {
    return <LoadingView />;
  }

  const manageUsers = lfg.owner.userID === currentUserID;
  const isFull = FezData.isFull(lfg);
  const isUnlimited = lfg.maxParticipants === 0;
  const isMember = FezData.isParticipant(lfg, currentUserID ?? undefined);
  const isWaitlist = FezData.isWaitlist(lfg, currentUserID ?? undefined);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
                onPress={() =>
                  navigation.push(CommonStackComponents.lfgAddParticipantScreen, {
                    fezID: lfg.fezID,
                    fezType: lfg.fezType,
                  })
                }
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
                    onPress={() =>
                      navigation.push(CommonStackComponents.lfgAddParticipantScreen, {
                        fezID: lfg.fezID,
                        fezType: lfg.fezType,
                      })
                    }
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
