import notifee from '@notifee/react-native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {HeaderEditButton} from '#src/Components/Buttons/HeaderButtons/HeaderEditButton';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {PersonalEventScreenActionsMenu} from '#src/Components/Menus/PersonalEvents/PersonalEventScreenActionsMenu';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';
import {FezData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.personalEventScreen>;

export const PersonalEventScreen = ({navigation, route}: Props) => {
  const {appConfig} = useConfig();
  const {data, refetch, isFetching} = useFezQuery({
    fezID: route.params.eventID,
  });
  const {data: profilePublicData} = useUserProfileQuery();
  const eventData = data?.pages[0];
  const showChat =
    eventData?.fezType === FezType.privateEvent && FezData.isParticipant(eventData, profilePublicData?.header);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {eventData && (
            <>
              {showChat && (
                <Item
                  title={'Chat'}
                  iconName={AppIcons.chat}
                  onPress={() => navigation.push(CommonStackComponents.lfgChatScreen, {fezID: eventData.fezID})}
                />
              )}
              {eventData.owner.userID === profilePublicData?.header.userID && (
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
        </HeaderButtons>
      </View>
    );
  }, [eventData, navigation, profilePublicData?.header.userID, showChat]);

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

  return (
    <ScheduleItemScreenBase eventData={eventData} onRefresh={refetch} refreshing={isFetching} showLfgChat={showChat} />
  );
};
