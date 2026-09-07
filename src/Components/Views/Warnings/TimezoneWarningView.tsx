import React from 'react';
import {Linking} from 'react-native';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {joinUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Banner shown when the device time zone does not match the server. Tapping opens the time zone screen.
 */
export const TimezoneWarningView = () => {
  const {showTimeZoneWarning} = useTime();
  const {serverUrl} = useSwiftarrQueryClient();
  const commonStack = useCommonStack();
  const onPress = () => commonStack.push(CommonStackComponents.mainTimeZoneScreen);

  // The WebView seems to be reporting the wrong time. It sticks with a device default
  // and not what its currently set to.
  // This here for debugging.
  const onLongPress = () => Linking.openURL(joinUrl(serverUrl, 'time'));

  return (
    <BaseWarningView
      variant={'negative'}
      title={'Time Zone Warning!'}
      message={'Your device is in a different time zone than the server.'}
      visible={showTimeZoneWarning}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
};
