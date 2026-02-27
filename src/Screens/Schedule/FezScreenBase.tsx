import pluralize from 'pluralize';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Badge, Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
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
import {getDurationString} from '#src/Libraries/DateTime';
import {guessDeckNumber} from '#src/Libraries/Ship';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {FezData} from '#src/Structs/ControllerStructs';

interface Props {
  fezData?: FezData;
  showLfgChat?: boolean;
  initialReadCount?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const FezScreenBase = ({
  fezData,
  showLfgChat = false,
  initialReadCount,
  refreshing = false,
  onRefresh,
}: Props) => {
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
    if (!fezData) {
      return;
    }
    const deck = guessDeckNumber(fezData.location);
    navigation.push(CommonStackComponents.mapScreen, {
      deckNumber: deck,
    });
  };

  const getChatDescription = () => {
    if (!fezData?.members) {
      return;
    }
    const readCountForBadge = initialReadCount ?? fezData.members.readCount;
    const unreadCount = fezData.members.postCount - readCountForBadge;
    return (
      <View style={styles.chatCountContainer}>
        <Text>
          {fezData.members.postCount} {pluralize('post', fezData.members.postCount)}
        </Text>
        {unreadCount !== 0 && <Badge style={styles.badge}>{`${unreadCount} new`}</Badge>}
      </View>
    );
  };

  if (!fezData) {
    return <LoadingView />;
  }

  const getInfoContent = () => <ContentText text={fezData.info} />;

  return (
    <AppView>
      {fezData.cancelled && (
        <View style={styles.cancelContainer}>
          <FezCanceledView fezType={fezData.fezType} />
        </View>
      )}
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padSides={false}>
          <ListSection>
            <DataFieldListItem icon={AppIcons.events} description={fezData.title} title={'Title'} />
            <DataFieldListItem
              icon={AppIcons.time}
              description={getDurationString(fezData.startTime, fezData.endTime, fezData.timeZoneID, true)}
              title={'Date'}
            />
            <DataFieldListItem
              icon={AppIcons.map}
              description={fezData.location}
              title={'Location'}
              onPress={handleLocation}
            />
            {(FezType.isLFGType(fezData.fezType) || fezData.fezType === FezType.privateEvent) && (
              <DataFieldListItem
                icon={AppIcons.user}
                description={getUserBylineString(fezData.owner, true, true)}
                title={'Owner'}
                onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: fezData.owner.userID})}
              />
            )}
            {showLfgChat && (
              <DataFieldListItem
                icon={AppIcons.chat}
                description={getChatDescription}
                title={'Chat'}
                onPress={() =>
                  navigation.push(
                    FezType.isPrivateEventType(fezData.fezType)
                      ? CommonStackComponents.privateEventChatScreen
                      : CommonStackComponents.lfgChatScreen,
                    {fezID: fezData.fezID, initialReadCount},
                  )
                }
              />
            )}
            <DataFieldListItem icon={AppIcons.description} description={getInfoContent} title={'Description'} />
            {fezData.fezType === FezType.privateEvent && (
              <UserChipsListItem
                users={fezData.members?.participants}
                title={'Participants'}
                onPress={() =>
                  navigation.push(CommonStackComponents.lfgParticipationScreen, {
                    fezID: fezData.fezID,
                  })
                }
              />
            )}
            {FezType.isLFGType(fezData.fezType) && showLfgChat && (
              <DataFieldListItem
                icon={AppIcons.group}
                description={FezData.getParticipantLabel(fezData)}
                title={'Participation'}
                onPress={() => navigation.push(CommonStackComponents.lfgParticipationScreen, {fezID: fezData.fezID})}
              />
            )}
            <DataFieldListItem icon={AppIcons.type} description={FezType.getLabel(fezData.fezType)} title={'Type'} />
            {fezData.fezType !== FezType.personalEvent && (
              <DataFieldListItem
                title={'Hosted By'}
                icon={AppIcons.user}
                onPress={() =>
                  navigation.push(CommonStackComponents.userProfileScreen, {
                    userID: fezData.owner.userID,
                  })
                }
                description={getUserBylineString(fezData.owner, true, true)}
              />
            )}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
      <LFGMembershipView lfg={fezData} />
    </AppView>
  );
};
