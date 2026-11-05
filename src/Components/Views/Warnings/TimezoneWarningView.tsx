import React from 'react';
import {Linking} from 'react-native';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {alertSilenceTimezoneWarnings} from '#src/Libraries/Alerts/SettingsAlerts';
import {appSiteUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

/**
 * Banner shown when the device time zone does not match the server. Tapping opens the time zone screen.
 * Long-pressing opens the server's time page in the WebView, for debugging.
 * Dismissal is persisted in AppConfig; re-enable it from Settings > Time.
 */
export const TimezoneWarningView = () => {
  const {showTimeZoneWarning} = useTime();
  const {appConfig, updateAppConfig} = useConfig();
  const commonStack = useCommonStack();
  const onPress = () => commonStack.push(CommonStackComponents.mainTimeZoneScreen);

  // The WebView seems to be reporting the wrong time. It sticks with a device default
  // and not what its currently set to.
  // This here for debugging.
  const onLongPress = () => Linking.openURL(appSiteUrl('time'));

  const onDismiss = () =>
    alertSilenceTimezoneWarnings(() =>
      updateAppConfig({...appConfig, silenceTimezoneWarnings: true, forceShowTimezoneWarning: false}),
    );

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
