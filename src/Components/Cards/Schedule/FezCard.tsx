import pluralize from 'pluralize';
import React, {memo, ReactNode, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Badge} from 'react-native-paper';

import {ScheduleItemCardBase} from '#src/Components/Cards/Schedule/ScheduleItemCardBase';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {useAppTheme} from '#src/Styles/Theme';
import {ScheduleCardMarkerType} from '#src/Types';

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
  const {data: profilePublicData} = useUserProfileQuery();

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
      return <AppIcon color={theme.colors.constantWhite} icon={outputIcon} />;
    }
  };

  /**
   * Only show the participation information if:
   * It's an LFG (doesnt matter if you're a member or not).
   * It's a Personal or Private Event and you are a member.
   */
  const showParticipation =
    FezType.isLFGType(fez.fezType) ||
    (FezType.isPrivateEventType(fez.fezType) && FezData.isParticipant(fez, profilePublicData?.header));

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
