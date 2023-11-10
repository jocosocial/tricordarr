import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../../Navigation/Stacks/ScheduleStackNavigator';
import {
  BottomTabComponents,
  MainStackComponents,
  NavigatorIDs,
  ScheduleStackComponents,
} from '../../../../libraries/Enums/Navigation';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {TitleTag} from '../../../Text/TitleTag';
import Clipboard from '@react-native-clipboard/clipboard';
import {RefreshControl, TouchableOpacity, View} from 'react-native';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {ListSection} from '../../../Lists/ListSection';
import {FezParticipantListItem} from '../../../Lists/Items/FezParticipantListItem';
import {useSeamailQuery} from '../../../Queries/Fez/FezQueries';
import {useFezParticipantMutation} from '../../../Queries/Fez/Management/UserQueries';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {FezParticipantAddItem} from '../../../Lists/Items/FezParticipantAddItem';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {HelpModalView} from '../../../Views/Modals/HelpModalView';
import {useModal} from '../../../Context/Contexts/ModalContext';
import {useBottomTabNavigator} from '../../../Navigation/Tabs/BottomTabNavigator';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.lfgParticipationScreen,
  NavigatorIDs.scheduleStack
>;

const helpContent = [
  "Don't just add random people to your LFG. It's not nice.",
  'If you add people to your LFG, those people should already expect to be added.',
  "Same idea with removing people: those removed should know why. Don't remove people who signed up just to bump your friend off the waitlist.",
  'If you schedule a "Drink Like a Pirate" LFG and someone joins and asks if they can come as a ninja instead, you may tell them it\'s more of a pirate thing and you may need to remove them to make room for more pirate participants.',
];

export const LfgParticipationScreen = ({navigation, route}: Props) => {
  const {fez, setFez} = useTwitarr();
  const {refetch} = useSeamailQuery({fezID: route.params.fezID});
  const [refreshing, setRefreshing] = useState(false);
  const participantMutation = useFezParticipantMutation();
  const {setErrorMessage} = useErrorHandler();
  const {profilePublicData} = useUserData();
  const {setModalContent, setModalVisible} = useModal();
  const bottomNav = useBottomTabNavigator();

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
          setFez(response.data);
        },
        onError: error => {
          setErrorMessage(error.response?.data.reason);
        },
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
            onPress={() => {
              setModalContent(<HelpModalView text={helpContent} />);
              setModalVisible(true);
            }}
          />
        </HeaderButtons>
      </View>
    ),
    [setModalContent, setModalVisible],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!fez || !fez.members) {
    return <LoadingView />;
  }

  const manageUsers = fez.owner.userID === profilePublicData?.header.userID;
  const isFull = fez.members.waitingList.length > 0 || fez.members.participants.length >= fez.maxParticipants;
  const isUnlimited = fez.maxParticipants === 0;
  const participantsString = isUnlimited
    ? `${fez.members.participants.length}`
    : `${fez.members.participants.length}/${fez.maxParticipants}`;

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <TouchableOpacity onLongPress={() => Clipboard.setString(fez.title)}>
            <TitleTag>Title</TitleTag>
            <Text>{fez.title}</Text>
          </TouchableOpacity>
        </PaddedContentView>
        <PaddedContentView padBottom={false}>
          <TitleTag>Participants ({participantsString})</TitleTag>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <ListSection>
            {manageUsers && !isFull && (
              <FezParticipantAddItem
                onPress={() => navigation.push(ScheduleStackComponents.lfgAddParticipantScreen, {fezID: fez.fezID})}
              />
            )}
            {fez.members.participants.map(u => (
              <FezParticipantListItem
                onRemove={() => onParticipantRemove(fez.fezID, u.userID)}
                key={u.userID}
                user={u}
                fez={fez}
                onPress={() =>
                  bottomNav.navigate(BottomTabComponents.homeTab, {
                    screen: MainStackComponents.userProfileScreen,
                    params: {userID: u.userID},
                  })
                }
              />
            ))}
          </ListSection>
        </PaddedContentView>
        {isFull && !isUnlimited && (
          <>
            <PaddedContentView padBottom={false}>
              <TitleTag>Waitlist ({fez.members.waitingList.length})</TitleTag>
            </PaddedContentView>
            <PaddedContentView padSides={false}>
              <ListSection>
                {manageUsers && (
                  <FezParticipantAddItem
                    onPress={() => navigation.push(ScheduleStackComponents.lfgAddParticipantScreen, {fezID: fez.fezID})}
                  />
                )}
                {fez.members.waitingList.map(u => (
                  <FezParticipantListItem
                    onRemove={() => onParticipantRemove(fez.fezID, u.userID)}
                    key={u.userID}
                    user={u}
                    fez={fez}
                    onPress={() =>
                      bottomNav.navigate(BottomTabComponents.homeTab, {
                        screen: MainStackComponents.userProfileScreen,
                        params: {userID: u.userID},
                      })
                    }
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
