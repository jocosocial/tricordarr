import pluralize from 'pluralize';
import React, {memo, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Badge} from 'react-native-paper';

import {ScheduleItemStatusBadge} from '#src/Components/Badges/ScheduleItemStatusBadge';
import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {FezCardActionsMenu} from '#src/Components/Menus/Fez/FezCardActionsMenu';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {getParticipantLabel} from '#src/Hooks/Fez/useFezData';
import {useMenu} from '#src/Hooks/useMenu';
import {isUserInFez} from '#src/Libraries/FezMembership';
import {unreadCount as unreadPostCount} from '#src/Libraries/UnreadCounts';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData} from '#src/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '#src/Types';

interface FezCardProps {
  fez: FezData;
  onPress?: () => void;
  onLongPress?: () => void;
  marker?: ScheduleCardMarkerType;
  showDay?: boolean;
  titleHeader?: string;
  enableReportOnly?: boolean;
  disabled?: boolean;
  /** When true, shows fez.info as the card description. Off by default so list cards stay compact. */
  showDescription?: boolean;
  /** When true, shows an "Added To" badge instead of the unread-post-count badge. */
  addedTo?: boolean;
}

const FezCardInternal = ({
  fez,
  onPress,
  onLongPress,
  marker,
  showDay = false,
  titleHeader,
  enableReportOnly = false,
  disabled = false,
  showDescription = false,
  addedTo = false,
}: FezCardProps) => {
  const {theme} = useAppTheme();
  const unreadCount = fez.members ? unreadPostCount(fez.members.postCount, fez.members.readCount) : 0;
  const {commonStyles} = useStyles();
  const {currentUserID} = useSession();
  const isMember = isUserInFez(fez, currentUserID);
  const commonNavigation = useCommonStack();
  const {visible: menuVisible, openMenu, closeMenu} = useMenu();
  const {primeFezDetail} = useFezCacheReducer();
  const participantLabel = getParticipantLabel(fez);

  const handlePress = useCallback(() => {
    primeFezDetail(fez);
    onPress?.();
  }, [fez, onPress, primeFezDetail]);

  const styles = StyleSheet.create({
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
    card: {
      backgroundColor: FezType.isLFGType(fez.fezType) ? theme.colors.outline : theme.colors.twitarrOrange,
    },
  });

  const getBadge = () => {
    if (enableReportOnly) {
      return (
        <AppIcon
          color={theme.colors.constantWhite}
          icon={AppIcons.report}
          onPress={() =>
            commonNavigation.push(CommonStackComponents.reportScreen, {
              contentType: ReportContentType.fez,
              contentID: fez.fezID,
            })
          }
        />
      );
    }
    // Marks an LFG or event the user is actually in. Moderators get members data on LFGs they have not
    // joined, so check the participant lists. It rides alongside whatever else the card is showing.
    const joinedIcon = isMember ? (
      <AppIcon
        color={theme.colors.constantWhite}
        icon={FezType.isLFGType(fez.fezType) ? AppIcons.lfgJoined : AppIcons.personalEvent}
      />
    ) : undefined;

    if (fez.cancelled) {
      return (
        <>
          {joinedIcon}
          <ScheduleItemStatusBadge status={'Cancelled'} />
        </>
      );
    }
    if (fez.members?.isMuted) {
      // Other mute icons in this app are Red. Because this one is not on the background
      // (is on a FezCard) instead I didn't like the contrast of the red on grey so I'm
      // making this white to match the text and other icons of this card style.
      return (
        <>
          {joinedIcon}
          <AppIcon icon={AppIcons.mute} color={theme.colors.constantWhite} />
        </>
      );
    }
    // Unlike mute, the star does not take the slot on its own: a favorited LFG is one you care
    // about, so hiding its unread count or "Added To" badge would be exactly backwards. White
    // rather than the usual yellow star, for the same contrast reason as the mute icon above.
    const favoriteIcon = fez.members?.isFavorite ? (
      <AppIcon icon={AppIcons.favorite} color={theme.colors.constantWhite} />
    ) : undefined;

    if (addedTo) {
      return (
        <>
          {joinedIcon}
          {favoriteIcon}
          <Badge style={styles.badge}>Added To</Badge>
        </>
      );
    }
    if (unreadCount) {
      return (
        <>
          {joinedIcon}
          {favoriteIcon}
          <Badge style={styles.badge}>{`${unreadCount} new ${pluralize('post', unreadCount)}`}</Badge>
        </>
      );
    }
    return (
      <>
        {joinedIcon}
        {favoriteIcon}
      </>
    );
  };

  /**
   * Only show the participation information if:
   * - It's an LFG (doesnt matter if you're a member or not).
   * - It's a Private Event (you're only seeing it because you're a participant).
   * PersonalEvents are personal to you and only have one participant: you.
   */
  const showParticipation = FezType.isLFGType(fez.fezType) || fez.fezType === FezType.privateEvent;

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress();
    } else if (fez.startTime && fez.endTime) {
      openMenu();
    }
  }, [onLongPress, fez.startTime, fez.endTime, openMenu]);

  const cardContent = (
    <ScheduleItemCardBase
      disabled={disabled}
      onPress={enableReportOnly ? undefined : handlePress}
      onLongPress={handleLongPress}
      cardStyle={styles.card}
      title={fez.title}
      author={fez.fezType === FezType.personalEvent ? undefined : fez.owner}
      participation={showParticipation ? participantLabel : undefined}
      location={fez.location}
      description={showDescription ? fez.info : undefined}
      titleRight={getBadge}
      startTime={fez.startTime}
      endTime={fez.endTime}
      timeZoneID={fez.timeZoneID}
      showDay={showDay}
      marker={marker}
      titleHeader={titleHeader}
    />
  );

  // Only show menu if fez has startTime and endTime (required for overlap calculation)
  if (fez.startTime && fez.endTime) {
    return <FezCardActionsMenu anchor={cardContent} fezData={fez} menuVisible={menuVisible} closeMenu={closeMenu} />;
  }

  return cardContent;
};

export const FezCard = memo(FezCardInternal);
