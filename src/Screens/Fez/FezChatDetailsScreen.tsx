import React, {useCallback, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {Text} from 'react-native-paper';
import {RefreshControl, TouchableOpacity, View} from 'react-native';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {TitleTag} from '../../Text/Tags/TitleTag.tsx';
import {ListSection} from '../../Lists/ListSection.tsx';
import {FezParticipantListItem} from '../../Lists/Items/FezParticipantListItem.tsx';
import {FezParticipantAddItem} from '../../Lists/Items/FezParticipantAddItem.tsx';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/FezManagementUserMutations.ts';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {WebSocketState} from '../../../Libraries/Network/Websockets.ts';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSocket} from '../../Context/Contexts/SocketContext.ts';
import {useFezQuery} from '../../Queries/Fez/FezQueries.ts';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

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
            return queryClient.invalidateQueries(key);
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
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>
          <TouchableOpacity onLongPress={() => Clipboard.setString(fez?.title)}>
            <TitleTag>Title</TitleTag>
            <Text>{fez.title}</Text>
          </TouchableOpacity>
        </PaddedContentView>
        <PaddedContentView>
          <TitleTag>Type</TitleTag>
          <Text>{fez.fezType}</Text>
        </PaddedContentView>
        <PaddedContentView>
          <TitleTag>Websocket</TitleTag>
          {fezSocket && <Text>{WebSocketState[fezSocket.readyState as keyof typeof WebSocketState]}</Text>}
          {!fezSocket && <Text>undefined</Text>}
        </PaddedContentView>
        <PaddedContentView padBottom={false}>
          <TitleTag style={[]}>Participants</TitleTag>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
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
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
