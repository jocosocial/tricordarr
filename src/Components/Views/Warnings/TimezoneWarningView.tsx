import React from 'react';
import {Linking, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const TimezoneWarningView = () => {
  const {commonStyles} = useStyles();
  const {showTimeZoneWarning} = useTime();
  const {serverUrl} = useSwiftarrQueryClient();
  const commonStack = useCommonStack();
  const onPress = () => commonStack.push(CommonStackComponents.mainTimeZoneScreen);

  // The WebView seems to be reporting the wrong time. It sticks with a device default
  // and not what its currently set to.
  // This here for debugging.
  const onLongPress = () => Linking.openURL(`${serverUrl}/time`);

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.twitarrNegative,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.paddingVerticalSmall,
    },
    headerText: {
      ...commonStyles.onTwitarrButton,
      ...commonStyles.bold,
    },
    subText: {
      ...commonStyles.onTwitarrButton,
    },
  });

  if (!showTimeZoneWarning) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.headerView} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.headerText}>Time Zone Warning!</Text>
      <Text variant={'bodyMedium'} style={styles.subText}>
        Your device is in a different time zone than the server.
      </Text>
    </TouchableOpacity>
  );
};
