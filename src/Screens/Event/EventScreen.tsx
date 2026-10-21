import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {HeaderFavoriteButton} from '#src/Components/Buttons/HeaderButtons/HeaderFavoriteButton';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {EventScreenActionsMenu} from '#src/Components/Menus/Events/EventScreenActionsMenu';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFavoriteMutation} from '#src/Queries/Events/EventFavoriteMutations';
import {useEventQuery} from '#src/Queries/Events/EventQueries';
import {ScheduleItemScreenBase} from '#src/Screens/Schedule/ScheduleItemScreenBase';
import {EventData, UserNotificationData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.eventScreen>;

export const EventScreen = ({navigation, route}: Props) => {
  const {data: eventData, refetch} = useEventQuery({
    eventID: route.params.eventID,
  });
  const {isLoggedIn} = useSession();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const queryClient = useQueryClient();
  const {updateFavorite} = useEventCacheReducer();

  const handleFavorite = useCallback(
    (event: EventData) => {
      const newValue = !event.isFavorite;
      // Optimistic: flip the cache immediately rather than waiting on the network round trip.
      updateFavorite(event, newValue);
      eventFavoriteMutation.mutate(
        {
          eventID: event.eventID,
          action: newValue ? 'favorite' : 'unfavorite',
        },
        {
          onSuccess: async () => {
            const invalidations = UserNotificationData.getCacheKeys().map(key =>
              queryClient.invalidateQueries({queryKey: key}),
            );
            await Promise.all(invalidations);
          },
          onError: () => {
            updateFavorite(event, !newValue);
          },
        },
      );
    },
    [eventFavoriteMutation, queryClient, updateFavorite],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons left>
          {eventData && (
            <>
              {isLoggedIn && (
                <HeaderFavoriteButton isFavorite={eventData.isFavorite} onPress={() => handleFavorite(eventData)} />
              )}
              <EventScreenActionsMenu event={eventData} />
            </>
          )}
        </MaterialHeaderButtons>
      </View>
    );
  }, [eventData, handleFavorite, isLoggedIn]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return <ScheduleItemScreenBase eventData={eventData} onRefresh={refetch} showLocationActions />;
};
