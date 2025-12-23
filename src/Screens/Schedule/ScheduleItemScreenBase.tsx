import pluralize from 'pluralize';
import React from 'react';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {Badge, Text} from 'react-native-paper';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {EventPerformerListItem} from '#src/Components/Lists/Items/Event/EventPerformerListItem';
import {UserChipsListItem} from '#src/Components/Lists/Items/UserChipsListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ContentText} from '#src/Components/Text/ContentText';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LFGMembershipView} from '#src/Components/Views/Schedule/LFGMembershipView';
import {LfgCanceledView} from '#src/Components/Views/Static/LfgCanceledView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {getDurationString} from '#src/Libraries/DateTime';
import {guessDeckNumber} from '#src/Libraries/Ship';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

interface Props {
  refreshing?: boolean;
  onRefresh?: () => void;
  eventData?: FezData | EventData;
  showLfgChat?: boolean;
}

export const ScheduleItemScreenBase = ({refreshing = false, onRefresh, eventData, showLfgChat = false}: Props) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    cancelContainer: {
      ...commonStyles.displayFlex,
      ...commonStyles.flexColumn,
    },
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.marginLeftSmall,
    },
    chatCountContainer: {
      ...commonStyles.flexRow,
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

  const getChatDescription = () => {
    if (!eventData || !('fezID' in eventData) || !eventData.members) {
      return;
    }
    const unreadCount = eventData.members.postCount - eventData.members.readCount;
    return (
      <View style={styles.chatCountContainer}>
        <Text>
          {eventData.members.postCount} {pluralize('post', eventData.members.postCount)}
        </Text>
        {unreadCount !== 0 && <Badge style={styles.badge}>{`${unreadCount} new`}</Badge>}
      </View>
    );
  };

  // I wrote this thinking it was needed, and now I don't believe that is true.
  // useEffect(() => {
  //   if (eventData && 'fezID' in eventData) {
  //     // Intentionally doesn't expire itself. Save that until you open the chat.
  //     // There's a bit of a race condition since opening this screen technically
  //     // marks it as read from the server perspective.
  //     console.log(`[ScheduleItemScreenBase.tsx] Marking fez as read ${eventData.fezID}`);
  //     const invalidations = FezData.getCacheKeys().map(key => {
  //       return queryClient.invalidateQueries(key);
  //     });
  //     Promise.all(invalidations);
  //   }
  // }, [eventData, queryClient]);

  if (!eventData) {
    return <LoadingView />;
  }

  const getInfoContent = () => {
    if ('fezID' in eventData) {
      return <ContentText text={eventData.info} />;
    } else if ('eventID' in eventData) {
      return <ContentText text={eventData.description} />;
    }
    return null;
  };

  return (
    <AppView>
      {'fezID' in eventData && eventData.cancelled && (
        <View style={styles.cancelContainer}>
          <LfgCanceledView />
        </View>
      )}
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {eventData && (
          <PaddedContentView padSides={false}>
            <ListSection>
              <DataFieldListItem icon={AppIcons.events} description={eventData.title} title={'Title'} />
              <DataFieldListItem
                icon={AppIcons.time}
                description={getDurationString(eventData.startTime, eventData.endTime, eventData.timeZoneID, true)}
                title={'Date'}
              />
              <DataFieldListItem
                icon={AppIcons.map}
                description={eventData.location}
                title={'Location'}
                onPress={handleLocation}
              />
              {'eventID' in eventData && (
                <>
                  <DataFieldListItem icon={AppIcons.type} description={eventData.eventType} title={'Type'} />
                  {eventData.description && (
                    <DataFieldListItem icon={AppIcons.description} description={getInfoContent} title={'Description'} />
                  )}
                  {eventData.performers.length !== 0 && <EventPerformerListItem performers={eventData.performers} />}
                </>
              )}
              {'fezID' in eventData && (
                <>
                  {FezType.isLFGType(eventData.fezType) ||
                    (eventData.fezType === FezType.privateEvent && (
                      <DataFieldListItem
                        icon={AppIcons.user}
                        description={getUserBylineString(eventData.owner, true, true)}
                        title={'Owner'}
                        onPress={() =>
                          navigation.push(CommonStackComponents.userProfileScreen, {userID: eventData.owner.userID})
                        }
                      />
                    ))}
                  {showLfgChat && (
                    <DataFieldListItem
                      icon={AppIcons.chat}
                      description={getChatDescription}
                      title={'Chat'}
                      onPress={() =>
                        navigation.push(
                          FezType.isPrivateEventType(eventData.fezType)
                            ? CommonStackComponents.privateEventChatScreen
                            : CommonStackComponents.lfgChatScreen,
                          {fezID: eventData.fezID},
                        )
                      }
                    />
                  )}
                  <DataFieldListItem icon={AppIcons.description} description={getInfoContent} title={'Description'} />
                  {eventData.fezType === FezType.privateEvent && (
                    <UserChipsListItem
                      users={eventData.members?.participants}
                      title={'Participants'}
                      onPress={() =>
                        navigation.push(CommonStackComponents.lfgParticipationScreen, {
                          fezID: eventData.fezID,
                        })
                      }
                    />
                  )}
                  {FezType.isLFGType(eventData.fezType) && showLfgChat && (
                    <DataFieldListItem
                      icon={AppIcons.group}
                      description={FezData.getParticipantLabel(eventData)}
                      title={'Participation'}
                      onPress={() =>
                        navigation.push(CommonStackComponents.lfgParticipationScreen, {fezID: eventData.fezID})
                      }
                    />
                  )}
                  <DataFieldListItem
                    icon={AppIcons.type}
                    description={FezType.getLabel(eventData.fezType)}
                    title={'Type'}
                  />
                  {eventData.fezType !== FezType.personalEvent && (
                    <DataFieldListItem
                      title={'Hosted By'}
                      icon={AppIcons.user}
                      onPress={() =>
                        navigation.push(CommonStackComponents.userProfileScreen, {
                          userID: eventData.owner.userID,
                        })
                      }
                      description={getUserBylineString(eventData.owner, true, true)}
                    />
                  )}
                </>
              )}
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
      {'fezID' in eventData && <LFGMembershipView lfg={eventData} />}
    </AppView>
  );
};
