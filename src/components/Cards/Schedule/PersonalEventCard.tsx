import React, {memo, ReactNode, useCallback} from 'react';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../../styles/Theme';
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {StyleSheet} from 'react-native';
import {FezType} from '../../../libraries/Enums/FezType.ts';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {Badge} from 'react-native-paper';
import pluralize from 'pluralize';
import {AndroidColor} from '@notifee/react-native';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface EventCardProps {
  eventData: FezData;
  onPress?: () => void;
  showDay?: boolean;
  marker?: ScheduleCardMarkerType;
  hideFavorite?: boolean;
  onLongPress?: () => void;
  titleHeader?: string;
  showReportButton?: boolean;
  showLfgIcon?: boolean;
}

const PersonalEventCardInternal = ({
  eventData,
  onPress,
  marker,
  onLongPress,
  titleHeader,
  showDay = false,
  showReportButton = false,
  showLfgIcon = false,
}: EventCardProps) => {
  const theme = useAppTheme();
  const {commonStyles} = useStyles();
  const unreadCount = eventData.members ? eventData.members.postCount - eventData.members.readCount : 0;
  const {setModalContent, setModalVisible} = useModal();
  const handleModal = useCallback(
    (content: ReactNode) => {
      setModalContent(content);
      setModalVisible(true);
    },
    [setModalContent, setModalVisible],
  );

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.twitarrOrange,
    },
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
  });

  const getBadge = () => {
    if (showReportButton) {
      return <AppIcon icon={AppIcons.report} onPress={() => handleModal(<ReportModalView fez={eventData} />)} />;
    }
    if (!!unreadCount || eventData.cancelled) {
      return (
        <Badge style={styles.badge}>
          {eventData.cancelled ? 'Cancelled' : `${unreadCount} new ${pluralize('post', unreadCount)}`}
        </Badge>
      );
    }
    if (showLfgIcon) {
      return <AppIcon color={AndroidColor.WHITE} icon={AppIcons.lfg} />;
    }
  };

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={styles.card}
      title={eventData.title}
      location={eventData.location}
      startTime={eventData.startTime}
      endTime={eventData.endTime}
      timeZoneID={eventData.timeZoneID}
      showDay={showDay}
      onLongPress={onLongPress}
      marker={marker}
      titleHeader={titleHeader}
      participation={
        eventData.members && eventData.fezType === FezType.privateEvent
          ? FezData.getParticipantLabel(eventData)
          : undefined
      }
      titleRight={getBadge}
    />
  );
};

export const PersonalEventCard = memo(PersonalEventCardInternal);
