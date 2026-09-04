import React, {useMemo} from 'react';
import {StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/src/types';

import {useStyles} from '#src/Context/Contexts/StyleContext';

export type WarningViewVariant = 'error' | 'negative' | 'neutral';

interface BaseWarningViewProps {
  variant?: WarningViewVariant;
  title?: string;
  message: string;
  messageVariant?: keyof typeof MD3TypescaleKey;
  visible?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
}

/**
 * Shared colored-bar warning used for status notices. Renders a pressable container when
 * `onPress` or `onLongPress` is provided; otherwise a plain View.
 */
export const BaseWarningView = ({
  variant = 'error',
  title,
  message,
  messageVariant,
  visible = true,
  onPress,
  onLongPress,
  disabled,
  containerStyle,
  titleStyle,
  messageStyle,
}: BaseWarningViewProps) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(() => {
    const backgroundStyle =
      variant === 'negative'
        ? commonStyles.twitarrNegative
        : variant === 'neutral'
          ? commonStyles.twitarrNeutral
          : commonStyles.errorContainer;
    const textStyle = variant === 'error' ? commonStyles.errorContainer : commonStyles.onTwitarrButton;

    return StyleSheet.create({
      container: {
        ...backgroundStyle,
        ...commonStyles.alignItemsCenter,
        ...commonStyles.paddingVerticalSmall,
        ...containerStyle,
      },
      title: {
        ...textStyle,
        ...commonStyles.bold,
        ...commonStyles.textCenter,
        ...commonStyles.fullWidth,
        ...titleStyle,
      },
      message: {
        ...textStyle,
        ...commonStyles.textCenter,
        ...commonStyles.fullWidth,
        ...messageStyle,
      },
    });
  }, [commonStyles, containerStyle, messageStyle, titleStyle, variant]);

  const resolvedMessageVariant = messageVariant ?? (title ? 'bodyMedium' : undefined);
  const isPressable = !!(onPress || onLongPress);

  if (!visible) {
    return null;
  }

  const content = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text variant={resolvedMessageVariant} style={styles.message}>
        {message}
      </Text>
    </>
  );

  if (isPressable) {
    return (
      <TouchableOpacity disabled={disabled} style={styles.container} onPress={onPress} onLongPress={onLongPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
};
