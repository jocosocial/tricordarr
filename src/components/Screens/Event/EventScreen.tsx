import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useEventQuery} from '../../Queries/Events/EventQueries';
import {Linking, RefreshControl, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {ListSection} from '../../Lists/ListSection';
import {AppIcon} from '../../Icons/AppIcon';
import {getDurationString} from '../../../libraries/DateTime';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useEventFavoriteMutation} from '../../Queries/Events/EventFavoriteQueries';
import {useAppTheme} from '../../../styles/Theme';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useQueryClient} from '@tanstack/react-query';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {guessDeckNumber} from '../../../libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';

const helpContent = [
  'Always check the official daily printed schedule to confirm event times/locations.',
  'Favoriting an event adds it to your schedule and gives you reminder notifications.',
  'All events are given a corresponding forum. You can use that to discuss the event by tapping the forum button in the Menu.',
];

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.eventScreen>;

export const EventScreen = ({navigation, route}: Props) => {
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
  const {setModalContent, setModalVisible} = useModal();

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
                  onPress={() => {
                    if (eventData.forum) {
                      navigation.push(CommonStackComponents.forumThreadScreen, {
                        forumID: eventData.forum,
                      });
                    }
                  }}
                />
              )}
            </>
          )}
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              setModalContent(<HelpModalView text={helpContent} />);
              setModalVisible(true);
            }}
          />
        </HeaderButtons>
      </View>
    );
  }, [eventData, handleFavorite, navigation, setModalContent, setModalVisible, theme.colors.twitarrYellow]);

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

  const handleLocation = () => {
    if (!eventData) {
      return;
    }
    const deck = guessDeckNumber(eventData.location);
    navigation.push(CommonStackComponents.mapScreen, {
      deckNumber: deck,
    });
  };

  const getIcon = (icon: string) => <AppIcon icon={icon} style={styles.icon} />;

  if (!eventData) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
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
                description={getDurationString(eventData.startTime, eventData.endTime, eventData.timeZoneID, true)}
                title={'Date'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.map)}
                description={eventData.location}
                title={'Location'}
                onPress={handleLocation}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.type)}
                description={eventData.eventType}
                title={'Type'}
              />
              {eventData.description && (
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.description)}
                  description={eventData.description}
                  title={'Description'}
                />
              )}
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
