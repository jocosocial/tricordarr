import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderEditButton} from '../../Buttons/HeaderButtons/HeaderEditButton.tsx';
import {PersonalEventScreenActionsMenu} from '../../Menus/PersonalEvents/PersonalEventScreenActionsMenu.tsx';
import {useFezQuery} from '../../Queries/Fez/FezQueries.ts';
import {ScheduleItemScreenBase} from '../Schedule/ScheduleItemScreenBase.tsx';
import notifee from '@notifee/react-native';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {FezType} from '../../../libraries/Enums/FezType.ts';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventScreen>;

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
