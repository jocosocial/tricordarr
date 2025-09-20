import React, {useCallback, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {Text} from 'react-native-paper';
import {RefreshControl, TouchableOpacity, View} from 'react-native';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {TitleTag} from '#src/Components/Text/Tags/TitleTag';
import {ListSection} from '#src/Components/Lists/ListSection';
import {FezParticipantListItem} from '#src/Components/Lists/Items/FezParticipantListItem';
import {FezParticipantAddItem} from '#src/Components/Lists/Items/FezParticipantAddItem';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {FezType} from '#src/Enums/FezType';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {AppIcons} from '#src/Enums/Icons';
import {WebSocketState} from '#src/Libraries/Network/Websockets';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {FezData} from '#src/Structs/ControllerStructs';
import {useQueryClient} from '@tanstack/react-query';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

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
