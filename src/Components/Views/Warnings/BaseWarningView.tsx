import React, {useMemo} from 'react';
import {StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import {MD3TypescaleKey} from 'react-native-paper/src/types';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';

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
  /** When provided, renders a dismiss ("X") button in the top-right corner that calls this on press. */
  onDismiss?: () => void;
  /** Color of the dismiss icon. Defaults to the resolved title/message text color. */
  dismissIconColor?: string;
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
  onDismiss,
  dismissIconColor,
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
        position: 'relative',
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
      dismissButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        margin: 0,
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
      {onDismiss ? (
        <IconButton
          icon={AppIcons.dismissCard}
          size={18}
          style={styles.dismissButton}
          iconColor={dismissIconColor ?? (styles.message.color as string | undefined)}
          onPress={onDismiss}
        />
      ) : null}
    </>
  );

  // Only wrap in TouchableOpacity when there's an actual onPress/onLongPress to serve.
  // Doing this unconditionally would give purely informational banners (e.g. ones that
  // only set onDismiss) a misleading press-opacity animation, expose them to screen
  // readers as tappable when they aren't, and add a second, functionless touch target
  // competing with the nested dismiss IconButton.
  if (isPressable) {
    return (
      <TouchableOpacity disabled={disabled} style={styles.container} onPress={onPress} onLongPress={onLongPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
};
