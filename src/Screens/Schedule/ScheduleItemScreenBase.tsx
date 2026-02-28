import pluralize from 'pluralize';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ScheduleItemStatusBadge} from '#src/Components/Badges/ScheduleItemStatusBadge';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {EventPerformerListItem} from '#src/Components/Lists/Items/Event/EventPerformerListItem';
import {EventPhotographerListItem} from '#src/Components/Lists/Items/Event/EventPhotographerListItem';
import {UserChipsListItem} from '#src/Components/Lists/Items/UserChipsListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ContentText} from '#src/Components/Text/ContentText';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LFGMembershipView} from '#src/Components/Views/Schedule/LFGMembershipView';
import {FezCanceledView} from '#src/Components/Views/Static/FezCanceledView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {getParticipantLabel} from '#src/Hooks/useFez';
import {getDurationString} from '#src/Libraries/DateTime';
import {guessDeckNumber} from '#src/Libraries/Ship';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {EventData, FezData} from '#src/Structs/ControllerStructs';

interface Props {
  refreshing?: boolean;
  onRefresh?: () => void;
  eventData?: FezData | EventData;
  showLfgChat?: boolean;
  initialReadCount?: number;
}

export const ScheduleItemScreenBase = ({
  refreshing = false,
  onRefresh,
  eventData,
  showLfgChat = false,
  initialReadCount,
}: Props) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    cancelContainer: {
      ...commonStyles.displayFlex,
      ...commonStyles.flexColumn,
    },
    badgeContainer: {
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
    const readCountForBadge = initialReadCount ?? eventData.members.readCount;
    const unreadCount = eventData.members.postCount - readCountForBadge;
    return (
      <View style={styles.chatCountContainer}>
        <Text>
          {eventData.members.postCount} {pluralize('post', eventData.members.postCount)}
        </Text>
        {eventData.members?.isMuted ? (
          <View style={styles.badgeContainer}>
            <ScheduleItemStatusBadge status={'Muted'} />
          </View>
        ) : unreadCount !== 0 ? (
          <View style={styles.badgeContainer}>
            <ScheduleItemStatusBadge status={`${unreadCount} new`} />
          </View>
        ) : null}
      </View>
    );
  };

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
          <FezCanceledView fezType={eventData.fezType} />
        </View>
      )}
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
                  {eventData.shutternautData?.photographers && eventData.shutternautData.photographers.length !== 0 && (
                    <EventPhotographerListItem photographers={eventData.shutternautData.photographers} />
                  )}
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
                          {fezID: eventData.fezID, initialReadCount},
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
                      description={getParticipantLabel(eventData)}
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
