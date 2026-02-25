import notifee from '@notifee/react-native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {HeaderEditButton} from '#src/Components/Buttons/HeaderButtons/HeaderEditButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PersonalEventScreenActionsMenu} from '#src/Components/Menus/PersonalEvents/PersonalEventScreenActionsMenu';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFez} from '#src/Hooks/useFez';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventScreen>;

export const PersonalEventScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.scheduleHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.personalevents} urlPath={'/privateevent/list'}>
        <PersonalEventScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const PersonalEventScreenInner = ({navigation, route}: Props) => {
  const {appConfig} = useConfig();
  const {fezData: eventData, isFetching, isOwner, isParticipant, refetch, initialReadCount} = useFez({
    fezID: route.params.eventID,
  });
  const {markRead} = useFezCacheReducer();

  const showChat = eventData?.fezType === FezType.privateEvent && isParticipant;

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons left>
          {eventData && (
            <>
              {showChat && (
                <Item
                  title={'Chat'}
                  iconName={AppIcons.chat}
                  onPress={() =>
                    navigation.push(CommonStackComponents.lfgChatScreen, {
                      fezID: eventData.fezID,
                      initialReadCount,
                    })
                  }
                />
              )}
              {isOwner && (
                <HeaderEditButton
                  iconName={AppIcons.edit}
                  onPress={() =>
                    navigation.push(CommonStackComponents.personalEventEditScreen, {
                      personalEvent: eventData,
                    })
                  }
                />
              )}
              <PersonalEventScreenActionsMenu event={eventData} />
            </>
          )}
        </MaterialHeaderButtons>
      </View>
    );
  }, [eventData, navigation, showChat, isOwner, initialReadCount]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      title: eventData?.fezType === FezType.privateEvent ? 'Private Event' : 'Personal Event',
    });
    if (appConfig.markReadCancelPush && eventData) {
      console.log('[PersonalEventScreen.tsx] auto canceling notifications.');
      notifee.cancelDisplayedNotification(eventData.fezID);
    }
  }, [getNavButtons, navigation, eventData, appConfig.markReadCancelPush]);

  useEffect(() => {
    if (eventData) {
      markRead(eventData.fezID);
    }
  }, [eventData, markRead]);

  return (
    <ScheduleItemScreenBase
      eventData={eventData}
      onRefresh={refetch}
      refreshing={isFetching}
      showLfgChat={showChat}
      initialReadCount={initialReadCount}
    />
  );
};
