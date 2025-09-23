import Clipboard from '@react-native-clipboard/clipboard';
import React, {PropsWithChildren} from 'react';
import {StyleProp, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';
import ReactTimeAgo from 'react-time-ago';

import {useConfig} from '#src/Context/Contexts/ConfigContext';

interface RelativeTimeTagProps {
  date?: Date;
  style?: StyleProp<TextStyle>;
  variant?: keyof typeof MD3TypescaleKey;
}

interface StylizedTextProps extends PropsWithChildren {
  variant?: keyof typeof MD3TypescaleKey;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

// ReactTimeAgo doesn't support dynamic styling of the component, and it's own
// style parameter is not what you think it is.
const StylizedText = (props: StylizedTextProps) => {
  return (
    <Text variant={props.variant} style={props.style} onPress={props.onPress} onLongPress={props.onLongPress}>
      {props.children}
    </Text>
  );
};

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
  const {appConfig} = useConfig();

  const onPress = () => {
    setShowRawTime(!showRawTime);
  };
  const onLongPress = () => (date ? Clipboard.setString(date.toISOString()) : undefined);

  if (!date) {
    return <></>;
  }

  if (showRawTime) {
    return (
      <StylizedText onPress={onPress} onLongPress={onLongPress} style={style} variant={variant}>
        {date?.toISOString()}
      </StylizedText>
    );
  }

  // https://github.com/catamphetamine/react-time-ago/issues/18
  // No, no. He's right. We is buggy.
  // "Unknown" props are passed through to the component.
  // https://github.com/Microsoft/TypeScript/issues/19573
  return (
    <ReactTimeAgo
      date={Date.parse(date.toString())}
      locale="en-US"
      component={StylizedText}
      // @ts-ignore
      variant={variant}
      onPress={appConfig.enableDeveloperOptions ? onPress : undefined}
      onLongPress={appConfig.enableDeveloperOptions ? onLongPress : undefined}
    />
  );
};
