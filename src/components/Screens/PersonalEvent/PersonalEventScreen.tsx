import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderEditButton} from '../../Buttons/HeaderButtons/HeaderEditButton.tsx';
import {PersonalEventScreenActionsMenu} from '../../Menus/PersonalEvents/PersonalEventScreenActionsMenu.tsx';
import {useFezQuery} from '../../Queries/Fez/FezQueries.ts';
import {ScheduleItemScreenBase} from '../Schedule/ScheduleItemScreenBase.tsx';
import notifee from '@notifee/react-native';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useUserData} from '../../Context/Contexts/UserDataContext.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventScreen>;

export const PersonalEventScreen = ({navigation, route}: Props) => {
  const {appConfig} = useConfig();
  const {data, refetch, isFetching} = useFezQuery({
    fezID: route.params.eventID,
  });
  const {profilePublicData} = useUserData();
  const eventData = data?.pages[0];

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {eventData && (
            <>
              {eventData.owner.userID === profilePublicData?.header.userID && (
                <HeaderEditButton
                  iconName={AppIcons.eventEdit}
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
  }, [eventData, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
    if (appConfig.markReadCancelPush && eventData) {
      console.log('[SeamailScreen.tsx] auto canceling notifications.');
      notifee.cancelDisplayedNotification(eventData.fezID);
    }
  }, [getNavButtons, navigation, eventData, appConfig.markReadCancelPush]);

  return <ScheduleItemScreenBase eventData={eventData} onRefresh={refetch} refreshing={isFetching} />;
};
