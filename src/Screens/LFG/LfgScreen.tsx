import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {useFez} from '#src/Hooks/useFez';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
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
  const {fezData, isOwner, isParticipant, isWaitlist, refetch, initialReadCount, resetInitialReadCount} =
    useFez({
      fezID: route.params.fezID,
    });
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const [lfg, setLfg] = useState<FezData>();
  const {notificationSocket} = useSocket();
  const isFocused = useIsFocused();
  const wasFocusedRef = useRef(isFocused);

  useEffect(() => {
    if (isFocused && !wasFocusedRef.current) {
      resetInitialReadCount();
    }
    wasFocusedRef.current = isFocused;
  }, [isFocused, resetInitialReadCount]);
  const {hasModerator} = usePrivilege();
  const showChat = hasModerator || isParticipant || isWaitlist;

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons left>
          {lfg && showChat && (
            <Item
              title={'Chat'}
              iconName={AppIcons.chat}
              onPress={() =>
                navigation.push(CommonStackComponents.lfgChatScreen, {
                  fezID: lfg.fezID,
                  initialReadCount,
                })
              }
            />
          )}
          {lfg && isOwner && (
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
  }, [lfg, navigation, showChat, isOwner, initialReadCount]);

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
    if (fezData) {
      setLfg(fezData);
    }
  }, [fezData, setLfg]);

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

  return (
    <ScheduleItemScreenBase
      refreshing={refreshing}
      onRefresh={onRefresh}
      eventData={lfg}
      showLfgChat={showChat}
      initialReadCount={initialReadCount}
    />
  );
};
