import React, {CSSProperties, PropsWithChildren} from 'react';
import {Text as NativeText, StyleProp, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/lib/typescript/types';
import ReactTimeAgo from 'react-time-ago';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useClipboard} from '#src/Hooks/useClipboard';

interface RelativeTimeTagProps {
  date?: Date;
  style?: StyleProp<TextStyle>;
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

const StylizedNativeText = (props: StylizedTextProps) => {
  return (
    <NativeText style={props.style} onPress={props.onPress} onLongPress={props.onLongPress}>
      {props.children}
    </NativeText>
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
 *
 * This had an annoying bug where every now and then the "now" part of "just now" would not render.
 * Multiple AI models failed to fix it but finally broke through when switching to NativeText
 * instead of [Paper]Text. There is some sort of layout race condition with measuring the width
 * with flexEnd. The fix for some of it is to set a minWidth on the parent. For others is to
 * avoid using the [Paper]Text component and switch this to NativeText, mimicking the styles.
 */
export const RelativeTimeTag = ({date, style}: RelativeTimeTagProps) => {
  const [showRawTime, setShowRawTime] = React.useState(false);
  const {appConfig} = useConfig();
  const {setString} = useClipboard();

  const onPress = () => {
    setShowRawTime(!showRawTime);
  };
  const onLongPress = () => (date ? setString(date.toISOString()) : undefined);

  if (!date) {
    return <></>;
  }

  if (showRawTime) {
    return (
      <StylizedNativeText onPress={onPress} onLongPress={onLongPress} style={style}>
        {date?.toISOString()}
      </StylizedNativeText>
    );
  }

  // Normalize to whole seconds so sub-second precision doesn't show "in a moment" on initial render.
  const dateMs = Math.floor(date.getTime() / 1000) * 1000;

  // https://github.com/catamphetamine/react-time-ago/issues/18
  // No, no. He's right. We is buggy.
  // "Unknown" props are passed through to the component.
  // https://github.com/Microsoft/TypeScript/issues/19573
  return (
    <ReactTimeAgo
      date={dateMs}
      locale={'en-US'}
      component={StylizedNativeText}
      // @ts-ignore
      // variant={variant}
      onPress={appConfig.enableDeveloperOptions ? onPress : undefined}
      onLongPress={appConfig.enableDeveloperOptions ? onLongPress : undefined}
      style={style as CSSProperties}
    />
  );
};
