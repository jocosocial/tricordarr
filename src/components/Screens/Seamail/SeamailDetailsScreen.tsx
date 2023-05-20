import React, {useCallback, useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStack';
import {NavigatorIDs, SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {Text} from 'react-native-paper';
import {RefreshControl, TouchableOpacity} from 'react-native';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {TitleTag} from '../../Text/TitleTag';
import {ListSection} from '../../Lists/ListSection';
import {FezParticipantListItem} from '../../Lists/Items/FezParticipantListItem';
import {FezParticipantAddItem} from '../../Lists/Items/FezParticipantAddItem';
import {LoadingView} from '../../Views/Static/LoadingView';
import {FezType} from '../../../libraries/Enums/FezType';
import {useFezParticipantMutation} from '../../Queries/Fez/Management/UserQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {NavBarIconButton} from '../../Buttons/IconButtons/NavBarIconButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useModal} from '../../Context/Contexts/ModalContext';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {WebSocketState} from '../../../libraries/Network/Websockets';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.seamailDetailsScreen,
  NavigatorIDs.seamailStack
>;

const helpContent = [
  'Seamail titles cannot be modified.',
  'With Open seamails, the creator can add or remove members at any time.',
];

export const SeamailDetailsScreen = ({route, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const participantMutation = useFezParticipantMutation();
  const {fez, setFez, dispatchFezList} = useTwitarr();
  const {setModalContent, setModalVisible} = useModal();
  const {fezSocket} = useSocket();
  const {refetch} = useSeamailQuery({fezID: route.params.fezID});
  const {profilePublicData} = useUserData();
  const {setErrorMessage} = useErrorHandler();

  console.log('rendering details');

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

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
        onError: error => {
          setErrorMessage(error.response?.data.reason);
        },
      },
    );
  };

  const getHeaderRight = useCallback(
    () => (
      <NavBarIconButton
        icon={AppIcons.help}
        onPress={() => {
          setModalContent(<HelpModalView text={helpContent} />);
          setModalVisible(true);
        }}
      />
    ),
    [setModalContent, setModalVisible],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getHeaderRight,
    });
  }, [getHeaderRight, navigation]);

  if (!fez) {
    return <LoadingView />;
  }

  const manageUsers = fez.fezType === FezType.open && fez.owner.userID === profilePublicData.header.userID;

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
          <TouchableOpacity onPress={() => console.log(fezSocket)}>
            <TitleTag>Websocket</TitleTag>
            {fezSocket && <Text>{WebSocketState[fezSocket.readyState as keyof typeof WebSocketState]}</Text>}
            {!fezSocket && <Text>undefined</Text>}
          </TouchableOpacity>
        </PaddedContentView>
        <PaddedContentView padBottom={false}>
          <TitleTag style={[]}>Participants</TitleTag>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <ListSection>
            {manageUsers && <FezParticipantAddItem fez={fez} />}
            {fez.members &&
              fez.members.participants.map(u => (
                <FezParticipantListItem
                  onRemove={() => onParticipantRemove(fez.fezID, u.userID)}
                  key={u.userID}
                  user={u}
                  fez={fez}
                />
              ))}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
