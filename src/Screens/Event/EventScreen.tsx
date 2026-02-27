import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {HeaderFavoriteButton} from '#src/Components/Buttons/HeaderButtons/HeaderFavoriteButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {EventScreenActionsMenu} from '#src/Components/Menus/Events/EventScreenActionsMenu';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useEventFavoriteMutation} from '#src/Queries/Events/EventFavoriteMutations';
import {useEventQuery} from '#src/Queries/Events/EventQueries';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';
import {EventData, UserNotificationData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.eventScreen>;

export const EventScreen = ({navigation, route}: Props) => {
  const {data: eventData, refetch} = useEventQuery({
    eventID: route.params.eventID,
  });
  const eventFavoriteMutation = useEventFavoriteMutation();
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
            const invalidations = UserNotificationData.getCacheKeys()
              .concat(EventData.getCacheKeys(event.eventID))
              .map(key => queryClient.invalidateQueries({queryKey: key}));
            await Promise.all(invalidations);
          },
        },
      );
    },
    [eventFavoriteMutation, queryClient],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons left>
          {eventData && (
            <>
              <HeaderFavoriteButton isFavorite={eventData.isFavorite} onPress={() => handleFavorite(eventData)} />
              <EventScreenActionsMenu event={eventData} />
            </>
          )}
        </MaterialHeaderButtons>
      </View>
    );
  }, [eventData, handleFavorite]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return <ScheduleItemScreenBase eventData={eventData} onRefresh={refetch} />;
};
