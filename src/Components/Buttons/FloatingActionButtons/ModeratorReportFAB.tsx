import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ReportModerationData} from '#src/Structs/ControllerStructs';

interface ModeratorReportFABProps {
  reports: ReportModerationData[];
  onHandleAll: () => void;
  onCloseAll: () => void;
  testIDPrefix: string;
  moderateUserID?: string;
}

/**
 * Expanding FAB on a content moderate screen for reports and user moderation.
 */
export const ModeratorReportFAB = ({
  reports,
  onHandleAll,
  onCloseAll,
  testIDPrefix,
  moderateUserID,
}: ModeratorReportFABProps) => {
  const navigation = useCommonStack();
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
  const modUserAction = moderateUserID
    ? FabGroupAction({
        icon: AppIcons.user,
        label: 'Moderate User',
        onPress: () => pushModerateResource(navigation, 'user', moderateUserID),
        testID: `${testIDPrefix}User-fab`,
      })
    : undefined;

  const actions = [
    ...(hasOpenReports ? [handleAllAction, closeAllAction] : []),
    ...(modUserAction ? [modUserAction] : []),
  ];

  return (
    <BaseFABGroup actions={actions} openLabel={'Actions'} icon={AppIcons.moderator} testID={`${testIDPrefix}-fab`} />
  );
};
