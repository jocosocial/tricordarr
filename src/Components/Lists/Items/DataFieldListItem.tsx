import React, {ReactNode, useCallback, useMemo, useState} from 'react';
import {StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {List} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useClipboard} from '#src/Hooks/useClipboard';
import {toSecureString} from '#src/Libraries/StringUtils';

interface DataFieldListItemProps {
  title?: string;
  description?: string | number | (() => ReactNode) | Element;
  onPress?: () => void;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  itemStyle?: ViewStyle;
  left?: () => ReactNode;
  icon?: string;
  onLongPress?: () => void;
  sensitive?: boolean;
}

/**
 * List.Item wrapper for displaying information or data to the user in a consistent manner.
 * Unlike ListItem, this is intended to be a dumb "Text Title + Text Description" component.
 *
 * To build a fancy List.Item such as Forum Thread or Seamail Conversation use ListItem
 * as your base instead.
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
  onLongPress,
  sensitive = false,
}: DataFieldListItemProps) => {
  const [showSensitive, setShowSensitive] = useState(false);
  const {commonStyles} = useStyles();
  const {setString} = useClipboard();
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
      ...(icon ? commonStyles.paddingHorizontalSmall : undefined),
      ...itemStyle,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
    /**
     * Default paddingLeft was 16, rendered inconsistent when no icon was provided.
     * I like this better for all cases. Consistent padding on each side of an icon
     * and consistent with new smaller margins.
     */
    content: {
      ...commonStyles.paddingLeftSmall,
    },
  });

  const getIcon = useCallback(
    () => (icon ? <AppIcon icon={icon} style={styles.icon} /> : undefined),
    [icon, styles.icon],
  );

  // Handle press: toggle sensitive visibility if sensitive is true, then call onPress if provided
  const handlePress = useCallback(() => {
    if (sensitive) {
      setShowSensitive(prev => !prev);
    }
    onPress?.();
  }, [sensitive, onPress]);

  // Mask sensitive string descriptions
  const displayDescription = useMemo(() => {
    if (sensitive && typeof description === 'string') {
      return showSensitive ? description : toSecureString(description);
    }
    return description;
  }, [description, sensitive, showSensitive]);

  return (
    <List.Item
      left={left || getIcon}
      style={styles.item}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      description={displayDescription}
      descriptionNumberOfLines={0}
      title={title}
      onPress={sensitive || onPress ? handlePress : undefined}
      onLongPress={
        onLongPress ||
        (() =>
          displayDescription && (typeof displayDescription === 'string' || typeof displayDescription === 'number')
            ? setString(displayDescription.toString())
            : undefined)
      }
      contentStyle={styles.content}
    />
  );
};
