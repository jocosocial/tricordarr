import React, {ReactNode, useCallback} from 'react';
import {List} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {TextStyle, ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import {AppIcon} from '../../Icons/AppIcon.tsx';

interface DataFieldListItemProps {
  title?: string;
  description?: string | number | (() => ReactNode);
  onPress?: () => void;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  itemStyle?: ViewStyle;
  left?: () => ReactNode;
  icon?: string;
}

/**
 * Item for user profile content.
 */
export const DataFieldListItem = ({
  title,
  description,
  onPress,
  titleStyle,
  descriptionStyle,
  itemStyle,
  icon,
  left,
}: DataFieldListItemProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    title: {
      ...commonStyles.fontSizeLabel,
      ...titleStyle,
      ...commonStyles.onBackground,
    },
    description: {
      ...commonStyles.fontSizeDefault,
      ...descriptionStyle,
      ...commonStyles.onBackground,
    },
    item: {
      ...(icon ? commonStyles.paddingHorizontal : undefined),
      ...itemStyle,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
  });

  const getIcon = useCallback(
    () => (icon ? <AppIcon icon={icon} style={styles.icon} /> : undefined),
    [icon, styles.icon],
  );

  return (
    <List.Item
      left={left || getIcon}
      style={styles.item}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      description={description}
      descriptionNumberOfLines={0}
      title={title}
      onPress={onPress}
      onLongPress={() =>
        description && (typeof description === 'string' || typeof description === 'number')
          ? Clipboard.setString(description.toString())
          : undefined
      }
    />
  );
};
