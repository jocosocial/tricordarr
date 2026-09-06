import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

interface ModeratorReportFABProps {
  reports: ReportModerationData[];
  onHandleAll: () => void;
  onCloseAll: () => void;
  testIDPrefix: string;
}

/**
 * Expanding FAB on a content moderate screen for report actions.
 */
export const ModeratorReportFAB = ({reports, onHandleAll, onCloseAll, testIDPrefix}: ModeratorReportFABProps) => {
  const hasOpenReports = reports.some(report => !report.isClosed);

  const handleAllAction = FabGroupAction({
    icon: AppIcons.markAsRead,
    label: 'Handle All Reports',
    onPress: onHandleAll,
    testID: `${testIDPrefix}HandleAll-fab`,
  });
  const closeAllAction = FabGroupAction({
    icon: AppIcons.close,
    label: 'Close All Reports',
    onPress: onCloseAll,
    testID: `${testIDPrefix}CloseAll-fab`,
  });

  if (!hasOpenReports) {
    return null;
  }

  return (
    <BaseFABGroup
      actions={[handleAllAction, closeAllAction]}
      openLabel={'Actions'}
      icon={AppIcons.moderator}
      testID={`${testIDPrefix}-fab`}
    />
  );
};
