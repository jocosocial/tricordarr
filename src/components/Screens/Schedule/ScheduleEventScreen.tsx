import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useEventQuery} from '../../Queries/Events/EventQueries';
import {Linking, RefreshControl, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ScheduleEventMenu} from '../../Menus/ScheduleEventMenu';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {ListSection} from '../../Lists/ListSection';
import {AppIcon} from '../../Images/AppIcon';
import {getDurationString} from '../../../libraries/DateTime';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteQueries';
import {useAppTheme} from '../../../styles/Theme';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useQueryClient} from '@tanstack/react-query';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.scheduleEventScreen,
  NavigatorIDs.scheduleStack
>;

export const ScheduleEventScreen = ({navigation, route}: Props) => {
  const {
    data: eventData,
    refetch,
    isFetching,
  } = useEventQuery({
    eventID: route.params.eventID,
  });
  const {commonStyles} = useStyles();
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
          onSuccess: () => {
            queryClient.setQueryData([`/events/${event.eventID}`], () => {
              return {
                ...event,
                isFavorite: !event.isFavorite,
              };
            });
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
              <Item
                title={'Favorite'}
                color={eventData.isFavorite ? theme.colors.twitarrYellow : undefined}
                iconName={AppIcons.favorite}
                onPress={() => handleFavorite(eventData)}
              />
              {eventData.forum && (
                <Item
                  title={'Forum'}
                  iconName={AppIcons.forum}
                  onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/forum/${eventData.forum}`)}
                />
              )}
            </>
          )}
          <ScheduleEventMenu />
        </HeaderButtons>
      </View>
    );
  }, [eventData, handleFavorite, theme]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
  });

  const getIcon = (icon: string) => <AppIcon icon={icon} style={styles.icon} />;

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {eventData && (
          <PaddedContentView padSides={false}>
            <ListSection>
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.events)}
                description={eventData.title}
                title={'Title'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.time)}
                description={getDurationString(eventData.startTime, eventData.endTime, eventData.timeZone, true)}
                title={'Time'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.map)}
                description={eventData.location}
                title={'Location'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.type)}
                description={eventData.eventType}
                title={'Type'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.description)}
                description={eventData.description}
                title={'Description'}
              />
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
