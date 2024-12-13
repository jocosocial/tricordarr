import React, {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {Text} from 'react-native-paper';
import {RefreshControl, TouchableOpacity, View} from 'react-native';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {TitleTag} from '../../Text/Tags/TitleTag';
import {ListSection} from '../../Lists/ListSection';
import {FezParticipantListItem} from '../../Lists/Items/FezParticipantListItem';
import {FezParticipantAddItem} from '../../Lists/Items/FezParticipantAddItem';
import {LoadingView} from '../../Views/Static/LoadingView';
import {FezType} from '../../../libraries/Enums/FezType';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/FezManagementUserMutations.ts';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {WebSocketState} from '../../../libraries/Network/Websockets';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {useFezQuery} from '../../Queries/Fez/FezQueries';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.seamailDetailsScreen>;

export const SeamailDetailsScreen = ({route, navigation}: Props) => {
  const participantMutation = useFezParticipantMutation();
  const {fez, setFez, dispatchFezList} = useTwitarr();
  const {fezSocket} = useSocket();
  const {refetch, isRefetching} = useFezQuery({fezID: route.params.fezID});
  const {profilePublicData} = useUserData();

  const onParticipantRemove = (fezID: string, userID: string) => {
    participantMutation.mutate(
      {
        action: 'remove',
        fezID: fezID,
        userID: userID,
      },
      {
        onSuccess: response => {
          dispatchFezList({
            type: FezListActions.updateFez,
            fez: response.data,
          });
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
            onPress={() => navigation.push(CommonStackComponents.seamailHelpScreen)}
          />
        </HeaderButtons>
      </View>
    ),
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderRight,
    });
  }, [getHeaderRight, navigation]);

  if (!fez) {
    return <LoadingView />;
  }

  const manageUsers = fez.fezType === FezType.open && fez.owner.userID === profilePublicData?.header.userID;

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
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
