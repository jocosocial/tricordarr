import React, {Dispatch, SetStateAction} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteQueries';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {useQueryClient} from '@tanstack/react-query';
import {EventDownloadMenuItem} from './Items/EventDownloadMenuItem';

interface EventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: EventData;
  menuVisible: boolean;
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}
export const EventCardActionsMenu = (props: EventCardActionsMenuProps) => {
  const commonNavigation = useCommonStack();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const queryClient = useQueryClient();

  const closeMenu = () => props.setMenuVisible(false);

  // I have no idea why the refreshing doesnt spin
  const handleFavoritePress = () => {
    closeMenu();
    if (props.setRefreshing) {
      props.setRefreshing(true);
    }
    eventFavoriteMutation.mutate(
      {
        eventID: props.eventData.eventID,
        action: props.eventData.isFavorite ? 'unfavorite' : 'favorite',
      },
      {
        onSuccess: async () => {
          // If this is too slow to reload, a setQueryData here may be in order.
          await Promise.all([
            queryClient.invalidateQueries(['/events']),
            queryClient.invalidateQueries([`/events/${props.eventData.eventID}`]),
            queryClient.invalidateQueries(['/events/favorites']),
            // Update the user notification data in case this was/is a favorite.
            queryClient.invalidateQueries(['/notification/global']),
          ]);
        },
        onSettled: () => {
          if (props.setRefreshing) {
            props.setRefreshing(false);
          }
        },
      },
    );
  };

  const handleForumPress = () => {
    closeMenu();
    if (props.eventData.forum) {
      commonNavigation.push(CommonStackComponents.forumThreadScreen, {
        forumID: props.eventData.forum,
      });
    }
  };

  return (
    <Menu visible={props.menuVisible} onDismiss={closeMenu} anchor={props.anchor}>
      <Menu.Item
        title={props.eventData.isFavorite ? 'Unfavorite' : 'Favorite'}
        leadingIcon={props.eventData.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
        onPress={handleFavoritePress}
      />
      {props.eventData.forum && <Menu.Item title={'Forum'} leadingIcon={AppIcons.forum} onPress={handleForumPress} />}
      <EventDownloadMenuItem closeMenu={closeMenu} event={props.eventData} />
    </Menu>
  );
};
