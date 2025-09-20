import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFezQuery} from '../../Queries/Fez/FezQueries.ts';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {LfgScreenActionsMenu} from '../../Menus/LFG/LfgScreenActionsMenu.tsx';
import {useSocket} from '../../Context/Contexts/SocketContext.ts';
import {useIsFocused} from '@react-navigation/native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {NotificationTypeData, SocketNotificationData} from '../../../Libraries/Structs/SocketStructs.ts';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {ScheduleItemScreenBase} from '../Schedule/ScheduleItemScreenBase.tsx';
import {HeaderEditButton} from '../../Buttons/HeaderButtons/HeaderEditButton.tsx';
import {NavHeaderTitle} from '../../Text/NavHeaderTitle.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

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
