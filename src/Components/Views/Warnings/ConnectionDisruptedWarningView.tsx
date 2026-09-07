import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {
  CommonStackComponents,
  useCommonRoute,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Banner shown when the API client cannot reach the server. Tapping opens server URL settings.
 */
export const ConnectionDisruptedWarningView = () => {
  const commonNavigation = useCommonStack();
  const commonRoute = useCommonRoute();

  const onPress = () => {
    commonNavigation.push(CommonStackComponents.configServerUrl);
  };

  return (
    <BaseWarningView
      variant={'error'}
      title={'Connection Disrupted'}
      message={'Tap here for more information'}
      messageVariant={'labelSmall'}
      onPress={onPress}
      disabled={commonRoute.name === CommonStackComponents.configServerUrl}
    />
  );
};
