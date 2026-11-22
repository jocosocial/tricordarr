import React from 'react';
import {Linking} from 'react-native';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {useDismissTimezoneWarning} from '#src/Hooks/useDismissTimezoneWarning';
import {appSiteUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Banner shown when the device time zone does not match the server. Tapping opens the time zone screen.
 * Long-pressing opens the server's time page in the WebView, for debugging.
 * Dismissal (for today or permanently) is persisted in AppConfig; re-enable it from Settings > Time.
 */
export const TimezoneWarningView = () => {
  const {showTimeZoneWarning} = useTime();
  const commonStack = useCommonStack();
  const onPress = () => commonStack.push(CommonStackComponents.mainTimeZoneScreen);

  // The WebView seems to be reporting the wrong time. It sticks with a device default
  // and not what its currently set to.
  // This here for debugging.
  const onLongPress = () => Linking.openURL(appSiteUrl('time'));

  const onDismiss = useDismissTimezoneWarning();

  return (
    <BaseWarningView
      variant={'negative'}
      title={'Time Zone Warning!'}
      message={'Your device is in a different time zone than the server.'}
      visible={showTimeZoneWarning}
      onPress={onPress}
      onLongPress={onLongPress}
      onDismiss={onDismiss}
    />
  );
};
