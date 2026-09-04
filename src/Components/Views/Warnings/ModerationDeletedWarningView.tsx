import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';

interface ModerationDeletedWarningViewProps {
  contentLabel: string;
  visible: boolean;
}

/**
 * Banner shown when the moderated content has already been deleted.
 */
export const ModerationDeletedWarningView = ({contentLabel, visible}: ModerationDeletedWarningViewProps) => {
  return <BaseWarningView variant={'error'} message={`This ${contentLabel} has been deleted.`} visible={visible} />;
};
