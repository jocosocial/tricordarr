import React, {PropsWithChildren} from 'react';
import {StyleProp, TextStyle, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import ReactTimeAgo from 'react-time-ago';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';
import Clipboard from '@react-native-clipboard/clipboard';

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
 */
export const RelativeTimeTag = ({date, style, variant}: RelativeTimeTagProps) => {
  const [showRawTime, setShowRawTime] = React.useState(false);

  const onPress = () => {
    setShowRawTime(!showRawTime);
  };

  if (!date) {
    return <></>;
  }

  // ReactTimeAgo doesn't support dynamic styling of the component, and it's own
  // style parameter is not what you think it is.
  const StylizedText = ({children}: PropsWithChildren) => {
    return (
      <Text variant={variant} style={style}>
        {children}
      </Text>
    );
  };

  if (showRawTime) {
    return (
      <TouchableOpacity onPress={onPress} onLongPress={() => Clipboard.setString(date?.toISOString())}>
        <StylizedText>{date?.toISOString()}</StylizedText>
      </TouchableOpacity>
    );
  }

  // https://github.com/catamphetamine/react-time-ago/issues/18
  // No, no. He's right. We is buggy.
  return (
    <TouchableOpacity onPress={onPress} onLongPress={() => Clipboard.setString(date?.toString())}>
      <ReactTimeAgo date={Date.parse(date.toString())} locale="en-US" component={StylizedText} />
    </TouchableOpacity>
  );
};
