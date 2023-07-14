import React from 'react';
import {List} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';

interface DataFieldListItemProps {
  title?: string;
  description?: string;
  onPress?: () => void;
}

/**
 * Item for user profile content.
 */
export const DataFieldListItem = ({title, description, onPress}: DataFieldListItemProps) => {
  const styles = {
    title: {
      fontSize: 12,
    },
    description: {
      fontSize: 16,
    },
  };

  const defaultOnPress = () => console.log('booo');

  return (
    <List.Item
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      description={description}
      title={title}
      onPress={onPress || defaultOnPress}
      onLongPress={() => (description ? Clipboard.setString(description) : undefined)}
    />
  );
};
