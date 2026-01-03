import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {HeaderEditButton} from '#src/Components/Buttons/HeaderButtons/HeaderEditButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {LfgScreenActionsMenu} from '#src/Components/Menus/LFG/LfgScreenActionsMenu';
import {NavHeaderTitle} from '#src/Components/Text/NavHeaderTitle';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgScreen>;

export const LfgScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={`/lfg/${props.route.params.fezID}`}>
        <LfgScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const LfgScreenInner = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useFezQuery({
    fezID: route.params.fezID,
  });
  const {data: profilePublicData} = useUserProfileQuery();
  const [lfg, setLfg] = useState<FezData>();
  const {notificationSocket} = useSocket();
  const isFocused = useIsFocused();
  const {hasModerator} = usePrivilege();
  const queryClient = useQueryClient();

  const showChat =
    hasModerator ||
    FezData.isParticipant(lfg, profilePublicData?.header) ||
    FezData.isWaitlist(lfg, profilePublicData?.header);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons left>
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
        </MaterialHeaderButtons>
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

  // Expire queries on first load
  useEffect(() => {
    // const invalidations = FezData.getCacheKeys().map(key => {
    //   return queryClient.invalidateQueries({queryKey: key});
    // });
    Promise.all(UserNotificationData.getCacheKeys().map(key => queryClient.invalidateQueries({queryKey: key})));
  }, [queryClient]);

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
