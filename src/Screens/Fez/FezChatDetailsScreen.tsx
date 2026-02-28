import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {FezParticipantAddItem} from '#src/Components/Lists/Items/FezParticipantAddItem';
import {FezParticipantListItem} from '#src/Components/Lists/Items/FezParticipantListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {FezChatDetailsScreenActionsMenu} from '#src/Components/Menus/Fez/FezChatDetailsScreenActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezData} from '#src/Hooks/useFezData';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {WebSocketState} from '#src/Libraries/Network/Websockets';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.fezChatDetailsScreen>;

/**
 * @TODO This needs a proper DisabledFeatureScreen wrapper but we dont have unique routes.
 * Consider passing the entire FezData for typing? or just FezType?
 */
export const FezChatDetailsScreen = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  // This overrides the default query options of refetchOnFocus and refetchOnMount. Since the user
  // just came from the chat screen the data is probably fresh enough to be just fine.
  const {fezData, refetch, isFetching, isOwner} = useFezData({fezID: route.params.fezID, queryOptions: {}});
  const {fezSockets} = useSocket();
  const {updateMembership} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});

  const onParticipantRemove = (fezID: string, userID: string) => {
    participantMutation.mutate(
      {
        action: 'remove',
        fezID: fezID,
        userID: userID,
      },
      {
        onSuccess: response => {
          updateMembership(fezID, response.data);
          dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
        },
      },
    );
  };

  const getHeaderRight = useCallback(() => {
    if (!fezData) {
      return <></>;
    }
    return (
      <View>
        <MaterialHeaderButtons left>
          <FezChatDetailsScreenActionsMenu fez={fezData} />
        </MaterialHeaderButtons>
      </View>
    );
  }, [fezData]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderRight,
    });
  }, [getHeaderRight, navigation]);

  if (!fezData) {
    return <LoadingView />;
  }

  const manageUsers = fezData.fezType === FezType.open && isOwner;

  const fezSocket = fezSockets[fezData.fezID];

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <DataFieldListItem title={'Title'} description={fezData.title} />
        <DataFieldListItem title={'Type'} description={fezData.fezType} />
        {fezData.members && <DataFieldListItem title={'Total Posts'} description={fezData.members?.postCount} />}
        <DataFieldListItem
          title={'Websocket'}
          description={fezSocket ? WebSocketState[fezSocket.readyState as keyof typeof WebSocketState] : 'undefined'}
        />
        <DataFieldListItem title={'Participants'} />
        <ListSection>
          {manageUsers && (
            <FezParticipantAddItem
              onPress={() => {
                navigation.push(CommonStackComponents.seamailAddParticipantScreen, {fez: fezData});
              }}
            />
          )}
          {fezData.members &&
            fezData.members.participants.map(u => (
              <FezParticipantListItem
                onRemove={() => onParticipantRemove(fezData.fezID, u.userID)}
                key={u.userID}
                user={u}
                fez={fezData}
                onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: u.userID})}
              />
            ))}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
