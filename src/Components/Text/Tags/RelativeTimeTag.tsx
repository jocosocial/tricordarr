import React from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';
import {useTimeAgo} from 'react-time-ago';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useClipboard} from '#src/Hooks/useClipboard';

interface RelativeTimeTagProps {
  date?: Date;
  style?: StyleProp<TextStyle>;
  variant?: keyof typeof MD3TypescaleKey;
}

/**
 * This follows the RelativeTimeTag from Swiftarr.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/Utilities/CustomLeafTags.swift.
 *
 * Relies on:
 * https://catamphetamine.gitlab.io/react-time-ago/
 * https://gitlab.com/catamphetamine/react-time-ago
 *
 * Many moons later I learned that Axios decodes a struct with ISO8601 strings for dates rather than
 * returning a Date object. This component and all consumer screens need to be updated for this reality.
 *
 * This had an annoying bug where every now and then the "now" part of "just now" would not render.
 * This was due to a layout race with flex-end: the extra component boundary was giving Yoga a frame where
 * the text node did not yet have its final measured width.
 * https://github.com/jocosocial/tricordarr/issues/419
 */
export const RelativeTimeTag = ({date, style, variant}: RelativeTimeTagProps) => {
  const [showRawTime, setShowRawTime] = React.useState(false);
  const {appConfig} = useConfig();
  const {setString} = useClipboard();
  const {commonStyles} = useStyles();

  // Normalize to whole seconds so sub-second precision doesn't show "in a moment" on initial render.
  const dateMs = date ? Math.floor(date.getTime() / 1000) * 1000 : 0;
  const {formattedDate} = useTimeAgo({
    date: dateMs,
    locale: 'en-US',
  });

  const onPress = () => {
    setShowRawTime(!showRawTime);
  };
  const onLongPress = () => (date ? setString(date.toISOString()) : undefined);

  if (!date) {
    return <></>;
  }

  if (showRawTime) {
    return (
      <Text variant={variant} onPress={onPress} onLongPress={onLongPress} style={style}>
        {date.toISOString()}
      </Text>
    );
  }

  return (
    <View>
      <Text
        variant={variant}
        style={[style, commonStyles.relativeTimeMinWidth]}
        onPress={appConfig.enableDeveloperOptions ? onPress : undefined}
        onLongPress={appConfig.enableDeveloperOptions ? onLongPress : undefined}>
        {formattedDate}
      </Text>
    </View>
  );
};
