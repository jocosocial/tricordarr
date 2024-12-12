import React, {memo, ReactNode, useCallback} from 'react';
import pluralize from 'pluralize';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../../styles/Theme';
import {Badge} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {AndroidColor} from '@notifee/react-native';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {FezType} from '../../../libraries/Enums/FezType.ts';

interface LfgCardProps {
  lfg: FezData;
  onPress?: () => void;
  marker?: ScheduleCardMarkerType;
  showLfgIcon?: boolean;
  showDay?: boolean;
  titleHeader?: string;
  showReportButton?: boolean;
}

const LfgCardInternal = ({
  lfg,
  onPress,
  marker,
  showLfgIcon = false,
  showDay = false,
  titleHeader,
  showReportButton = false,
}: LfgCardProps) => {
  const theme = useAppTheme();
  const unreadCount = lfg.members ? lfg.members.postCount - lfg.members.readCount : 0;
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
  });

  const getBadge = () => {
    if (showReportButton) {
      return <AppIcon icon={AppIcons.report} onPress={() => handleModal(<ReportModalView fez={lfg} />)} />;
    }
    if (!!unreadCount || lfg.cancelled) {
      return (
        <Badge style={styles.badge}>
          {lfg.cancelled ? 'Cancelled' : `${unreadCount} new ${pluralize('post', unreadCount)}`}
        </Badge>
      );
    }
    if (showLfgIcon) {
      return <AppIcon color={AndroidColor.WHITE} icon={AppIcons.lfg} />;
    }
  };

  return (
    <ScheduleItemCardBase
      onPress={showReportButton ? undefined : onPress}
      cardStyle={{
        backgroundColor: theme.colors.outline,
      }}
      title={lfg.title}
      author={lfg.owner}
      participation={lfg.members && FezType.isLFGType(lfg.fezType) ? FezData.getParticipantLabel(lfg) : undefined}
      location={lfg.location}
      titleRight={getBadge}
      startTime={lfg.startTime}
      endTime={lfg.endTime}
      timeZoneID={lfg.timeZoneID}
      showDay={showDay}
      marker={marker}
      titleHeader={titleHeader}
    />
  );
};

export const LfgCard = memo(LfgCardInternal);
