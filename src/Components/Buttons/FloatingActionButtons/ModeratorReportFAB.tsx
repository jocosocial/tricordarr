import * as React from 'react';

import {BaseFABGroup} from '#src/Components/Buttons/FloatingActionButtons/BaseFABGroup';
import {FabGroupAction} from '#src/Components/Buttons/FloatingActionButtons/FABGroupAction';
import {AppIcons} from '#src/Enums/Icons';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ForumPostModerationData} from '#src/Structs/ControllerStructs';

interface ModeratorReportFABProps {
  data: ForumPostModerationData;
  onHandleAll: () => void;
  onCloseAll: () => void;
}

/**
 * Expanding FAB on a content moderate screen for reports and user moderation.
 */
export const ModeratorReportFAB = ({data, onHandleAll, onCloseAll}: ModeratorReportFABProps) => {
  const navigation = useCommonStack();
  const hasOpenReports = data.reports.some(report => !report.isClosed);

  const handleAllAction = FabGroupAction({
    icon: AppIcons.markAsRead,
    label: 'Handle All Reports',
    onPress: onHandleAll,
    testID: 'forumPostModerateHandleAll-fab',
  });
  const closeAllAction = FabGroupAction({
    icon: AppIcons.close,
    label: 'Close All Reports',
    onPress: onCloseAll,
    testID: 'forumPostModerateCloseAll-fab',
  });
  const modUserAction = FabGroupAction({
    icon: AppIcons.user,
    label: 'Moderate User',
    onPress: () => pushModerateResource(navigation, 'user', data.forumPost.author.userID),
    testID: 'forumPostModerateUser-fab',
  });

  const actions = [...(hasOpenReports ? [handleAllAction, closeAllAction] : []), modUserAction];

  return (
    <BaseFABGroup actions={actions} openLabel={'Actions'} icon={AppIcons.moderator} testID={'forumPostModerate-fab'} />
  );
};
