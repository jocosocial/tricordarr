import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useElevation} from '#src/Context/Contexts/ElevationContext';

/**
 * Banner shown when the current user is posting as a privileged account.
 */
export const PostAsUserWarningView = () => {
  const {asPrivilegedUser} = useElevation();

  return <BaseWarningView variant={'error'} message={`Posting as ${asPrivilegedUser}`} visible={!!asPrivilegedUser} />;
};
