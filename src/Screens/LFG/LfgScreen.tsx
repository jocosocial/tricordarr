import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
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
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';
import {FezData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgScreen>;

export const LfgScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
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
  const {markRead} = useFezCacheReducer();

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

  /**
   * Mark as Read. Even though you may not have "read" it (tapping the Chat screen)
   * the API considers the GET in this screen as you reading it.
   * Expire queries only if there are unread messages.
   * This intentionally does not expire the Fez data query (ie, passing a fezID)
   * because we want the user to have a chance to notice they have unread messages.
   */
  useEffect(() => {
    if (lfg?.members && lfg.members.postCount > lfg.members.readCount) {
      markRead(lfg.fezID);
    }
  }, [lfg, markRead]);

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
