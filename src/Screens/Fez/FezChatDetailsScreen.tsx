import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {FezParticipantAddItem} from '#src/Components/Lists/Items/FezParticipantAddItem';
import {FezParticipantListItem} from '#src/Components/Lists/Items/FezParticipantListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {WebSocketState} from '#src/Libraries/Network/Websockets';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.fezChatDetailsScreen>;

export const FezChatDetailsScreen = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  const {data, refetch, isFetching} = useFezQuery({fezID: route.params.fezID});
  const {fezSockets} = useSocket();
  const [fez, setFez] = useState<FezData>();
  const {data: profilePublicData} = useUserProfileQuery();
  const queryClient = useQueryClient();

  const onParticipantRemove = (fezID: string, userID: string) => {
    participantMutation.mutate(
      {
        action: 'remove',
        fezID: fezID,
        userID: userID,
      },
      {
        onSuccess: async response => {
          const invalidations = FezData.getCacheKeys(fezID).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
          setFez(response.data);
        },
      },
    );
  };

  const getHeaderRight = useCallback(
    () => (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              if (fez) {
                navigation.push(FezType.getHelpRoute(fez.fezType));
              }
            }}
          />
        </HeaderButtons>
      </View>
    ),
    [fez, navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderRight,
    });
  }, [getHeaderRight, navigation]);

  // Initial set useEffect
  useEffect(() => {
    if (data) {
      setFez(data?.pages[0]);
    }
  }, [data, setFez]);

  if (!fez) {
    return <LoadingView />;
  }

  const manageUsers = fez.fezType === FezType.open && fez.owner.userID === profilePublicData?.header.userID;

  const fezSocket = fezSockets[fez.fezID];

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <DataFieldListItem title={'Title'} description={fez.title} />
        <DataFieldListItem title={'Type'} description={fez.fezType} />
        {fez.members && <DataFieldListItem title={'Total Posts'} description={fez.members?.postCount} />}
        <DataFieldListItem
          title={'Websocket'}
          description={fezSocket ? WebSocketState[fezSocket.readyState as keyof typeof WebSocketState] : 'undefined'}
        />
        <DataFieldListItem title={'Participants'} />
        <ListSection>
          {manageUsers && (
            <FezParticipantAddItem
              onPress={() => {
                navigation.push(CommonStackComponents.seamailAddParticipantScreen, {fez: fez});
              }}
            />
          )}
          {fez.members &&
            fez.members.participants.map(u => (
              <FezParticipantListItem
                onRemove={() => onParticipantRemove(fez.fezID, u.userID)}
                key={u.userID}
                user={u}
                fez={fez}
                onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: u.userID})}
              />
            ))}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
