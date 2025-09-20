import React, {useCallback, useEffect} from 'react';
import {useEventQuery} from '#src/Queries/Events/EventQueries';
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {AppIcons} from '#src/Enums/Icons';
import {useEventFavoriteMutation} from '#src/Queries/Events/EventFavoriteMutations';
import {useAppTheme} from '#src/Styles/Theme';
import {EventData} from '#src/Structs/ControllerStructs';
import {useQueryClient} from '@tanstack/react-query';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {EventScreenActionsMenu} from '#src/Components/Menus/Events/EventScreenActionsMenu';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';
import {HeaderFavoriteButton} from '#src/Components/Buttons/HeaderButtons/HeaderFavoriteButton';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.eventScreen>;

export const EventScreen = ({navigation, route}: Props) => {
  const {
    data: eventData,
    refetch,
    isFetching,
  } = useEventQuery({
    eventID: route.params.eventID,
  });
  const eventFavoriteMutation = useEventFavoriteMutation();
  const theme = useAppTheme();
  const queryClient = useQueryClient();

  const handleFavorite = useCallback(
    (event: EventData) => {
      eventFavoriteMutation.mutate(
        {
          eventID: event.eventID,
          action: event.isFavorite ? 'unfavorite' : 'favorite',
        },
        {
          onSuccess: async () => {
            await Promise.all([
              queryClient.invalidateQueries(['/events']),
              queryClient.invalidateQueries([`/events/${event.eventID}`]),
              queryClient.invalidateQueries(['/events/favorites']),
              // Update the user notification data in case this was/is a favorite.
              queryClient.invalidateQueries(['/notification/global']),
            ]);
          },
        },
      );
    },
    [eventFavoriteMutation, queryClient],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {eventData && (
            <>
              <HeaderFavoriteButton isFavorite={eventData.isFavorite} onPress={() => handleFavorite(eventData)} />
              {eventData.forum && (
                <Item
                  title={'Forum'}
                  iconName={AppIcons.forum}
                  onPress={() => {
                    if (eventData.forum) {
                      navigation.push(CommonStackComponents.forumThreadScreen, {
                        forumID: eventData.forum,
                      });
                    }
                  }}
                />
              )}
              <EventScreenActionsMenu event={eventData} />
            </>
          )}
        </HeaderButtons>
      </View>
    );
  }, [eventData, handleFavorite, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return <ScheduleItemScreenBase eventData={eventData} refreshing={isFetching} onRefresh={refetch} />;
};
