import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {useAppTheme} from '../../../styles/Theme.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import React, {memo, ReactNode, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {Badge} from 'react-native-paper';
import pluralize from 'pluralize';
import {AndroidColor} from '@notifee/react-native';
import {FezType} from '../../../libraries/Enums/FezType.ts';
import {ScheduleItemCardBase} from './ScheduleItemCardBase.tsx';

interface FezCardProps {
  fez: FezData;
  onPress?: () => void;
  onLongPress?: () => void;
  marker?: ScheduleCardMarkerType;
  showIcon?: boolean;
  showDay?: boolean;
  titleHeader?: string;
  enableReportOnly?: boolean;
  icon?: string;
}

const FezCardInternal = ({
  fez,
  onPress,
  onLongPress,
  marker,
  showIcon = false,
  showDay = false,
  titleHeader,
  enableReportOnly = false,
  icon,
}: FezCardProps) => {
  const theme = useAppTheme();
  const unreadCount = fez.members ? fez.members.postCount - fez.members.readCount : 0;
  const {commonStyles} = useStyles();
  const {setModalContent, setModalVisible} = useModal();
  const handleModal = useCallback(
    (content: ReactNode) => {
      setModalContent(content);
      setModalVisible(true);
    },
    [setModalContent, setModalVisible],
  );

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
      return <AppIcon icon={AppIcons.report} onPress={() => handleModal(<ReportModalView fez={fez} />)} />;
    }
    if (!!unreadCount || fez.cancelled) {
      return (
        <Badge style={styles.badge}>
          {fez.cancelled ? 'Cancelled' : `${unreadCount} new ${pluralize('post', unreadCount)}`}
        </Badge>
      );
    }
    if (showIcon) {
      const outputIcon = icon ? icon : FezType.isLFGType(fez.fezType) ? AppIcons.lfg : AppIcons.personalEvent;
      return <AppIcon color={AndroidColor.WHITE} icon={outputIcon} />;
    }
  };

  // Only show the participation information if:
  // * You are a member AND
  // * It's an LFG or a Private Event. Personal Events don't count since you're the only member.
  const showParticipation = fez.members && (FezType.isLFGType(fez.fezType) || fez.fezType === FezType.privateEvent);

  return (
    <ScheduleItemCardBase
      onPress={enableReportOnly ? undefined : onPress}
      onLongPress={onLongPress}
      cardStyle={styles.card}
      title={fez.title}
      author={fez.fezType === FezType.personalEvent ? undefined : fez.owner}
      participation={showParticipation ? FezData.getParticipantLabel(fez) : undefined}
      location={fez.location}
      titleRight={getBadge}
      startTime={fez.startTime}
      endTime={fez.endTime}
      timeZoneID={fez.timeZoneID}
      showDay={showDay}
      marker={marker}
      titleHeader={titleHeader}
    />
  );
};

export const FezCard = memo(FezCardInternal);
