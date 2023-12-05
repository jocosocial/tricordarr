import React, {Dispatch, SetStateAction} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {BottomTabComponents, ForumStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {ScheduleListActions} from '../../Reducers/Schedule/ScheduleListReducer';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteQueries';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useEventFavoriteQuery} from '../../Queries/Events/EventQueries';

interface EventCardActionsMenuProps {
  anchor: JSX.Element;
  eventData: EventData;
  menuVisible: boolean;
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}
export const EventCardActionsMenu = (props: EventCardActionsMenuProps) => {
  const rootNavigation = useRootStack();
  const eventFavoriteMutation = useEventFavoriteMutation();
  const {setInfoMessage} = useErrorHandler();
  const {dispatchScheduleList} = useTwitarr();
  const {refetchUserNotificationData} = useUserNotificationData();
  const {data: favoritesData, refetch: refetchFavorites} = useEventFavoriteQuery({enabled: false});

  const closeMenu = () => props.setMenuVisible(false);

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
        onSuccess: () => {
          setInfoMessage(`${props.eventData.isFavorite ? 'Unfollowed' : 'Followed'} event ${props.eventData.title}`);
          dispatchScheduleList({
            type: ScheduleListActions.updateEvent,
            newEvent: {
              ...props.eventData,
              isFavorite: !props.eventData.isFavorite,
            },
          });
          if (props.setRefreshing) {
            props.setRefreshing(false);
          }
          // Update the user notification data in case this was/is a favorite.
          refetchUserNotificationData();
          // Update favorites
          if (favoritesData !== undefined) {
            refetchFavorites();
          }
        },
      },
    );
  };

  const handleForumPress = () => {
    closeMenu();
    if (props.eventData.forum) {
      rootNavigation.push(RootStackComponents.rootContentScreen, {
        screen: BottomTabComponents.forumsTab,
        params: {
          screen: ForumStackComponents.forumThreadScreen,
          // initial false needed here to enable the stack to popToTop on bottom button press.
          initial: false,
          params: {
            forumID: props.eventData.forum,
          },
        },
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
    </Menu>
  );
};
