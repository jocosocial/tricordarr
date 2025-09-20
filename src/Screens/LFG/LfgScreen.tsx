import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {AppIcons} from '#src/Enums/Icons';
import {FezData} from '#src/Structs/ControllerStructs';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {LfgScreenActionsMenu} from '#src/Components/Menus/LFG/LfgScreenActionsMenu';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useIsFocused} from '@react-navigation/native';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';
import {HeaderEditButton} from '#src/Components/Buttons/HeaderButtons/HeaderEditButton';
import {NavHeaderTitle} from '#src/Components/Text/NavHeaderTitle';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.lfgScreen>;

export const LfgScreen = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useFezQuery({
    fezID: route.params.fezID,
  });
  const {data: profilePublicData} = useUserProfileQuery();
  const [lfg, setLfg] = useState<FezData>();
  const {notificationSocket} = useSocket();
  const isFocused = useIsFocused();
  const {hasModerator} = usePrivilege();

  const showChat =
    hasModerator ||
    FezData.isParticipant(lfg, profilePublicData?.header) ||
    FezData.isWaitlist(lfg, profilePublicData?.header);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {lfg && profilePublicData && showChat && (
            <Item
              title={'Chat'}
              iconName={AppIcons.chat}
              onPress={() => navigation.push(CommonStackComponents.lfgChatScreen, {fezID: lfg.fezID})}
            />
          )}
          {lfg && lfg.owner.userID === profilePublicData?.header.userID && (
            <HeaderEditButton
              iconName={AppIcons.edit}
              onPress={() =>
                navigation.push(CommonStackComponents.lfgEditScreen, {
                  fez: lfg,
                })
              }
            />
          )}
          {lfg && <LfgScreenActionsMenu fezData={lfg} />}
        </HeaderButtons>
      </View>
    );
  }, [lfg, navigation, profilePublicData, showChat]);

  const getHeaderTitle = useCallback(() => {
    const onPress = () =>
      navigation.push(CommonStackComponents.lfgParticipationScreen, {
        fezID: route.params.fezID,
      });
    if (lfg) {
      return <NavHeaderTitle title={'Looking For Group'} onPress={onPress} />;
    }
  }, [lfg, navigation, route.params.fezID]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      headerTitle: getHeaderTitle,
    });
  }, [getNavButtons, lfg, navigation, getHeaderTitle]);

  useEffect(() => {
    if (data) {
      setLfg(data.pages[0]);
    }
  }, [data, setLfg]);

  // Mark as Read. Even though you may not have "read" it (tapping the Chat screen)
  // the API considers the GET in this screen as you reading it.
  // useEffect(() => {
  //   if (lfg && lfg.members && lfg.members.readCount !== lfg.members.postCount) {
  //     refetchUserNotificationData();
  //   }
  //   // @TODO this is still leaking. Is it?
  //   if (isFocused) {
  //     closeFezSocket();
  //   }
  // }, [closeFezSocket, lfg, isFocused, refetchUserNotificationData]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.fezUnreadMsg) {
        if (lfg && lfg.members && lfg.fezID === socketMessage.contentID) {
          setLfg({
            ...lfg,
            members: {
              ...lfg.members,
              postCount: lfg.members.postCount + 1,
            },
          });
        }
      }
    },
    [lfg, setLfg],
  );

  useEffect(() => {
    if (notificationSocket && isFocused) {
      notificationSocket.addEventListener('message', notificationHandler);
    } else if (notificationSocket && !isFocused) {
      notificationSocket.removeEventListener('message', notificationHandler);
    }
    return () => {
      if (notificationSocket) {
        notificationSocket.removeEventListener('message', notificationHandler);
      }
    };
  }, [isFocused, notificationHandler, notificationSocket]);

  return <ScheduleItemScreenBase refreshing={isFetching} onRefresh={refetch} eventData={lfg} showLfgChat={showChat} />;
};
