import React from 'react';
import {List} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {TextStyle, ViewStyle} from 'react-native';

interface DataFieldListItemProps {
  title?: string;
  description?: string;
  onPress?: () => void;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  itemStyle?: ViewStyle;
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
}: DataFieldListItemProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    title: {
      ...commonStyles.fontSizeLabel,
      ...titleStyle,
    },
    description: {
      ...commonStyles.fontSizeDefault,
      ...descriptionStyle,
    },
  };

  return (
    <List.Item
      style={itemStyle}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      description={description}
      descriptionNumberOfLines={0}
      title={title}
      onPress={onPress}
      onLongPress={() => (description ? Clipboard.setString(description) : undefined)}
    />
  );
};
