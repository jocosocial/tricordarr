import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';

/**
 * Banner on admin settings screens when the current account cannot edit them.
 */
export const ServerSettingsReadOnlyWarningView = () => {
  const {canEditSettings} = useAdminAccess();

  return (
    <BaseWarningView
      variant={'negative'}
      title={'Read-Only Settings'}
      message={'Only the admin account can change them.'}
      visible={!canEditSettings}
    />
  );
};
