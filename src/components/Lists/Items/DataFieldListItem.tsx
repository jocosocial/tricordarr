import React from 'react';
import {List, Text} from 'react-native-paper';

interface DataFieldListItemProps {
  title?: string;
  description?: string;
  onPress?: () => void;
}

export const DataFieldListItem = ({title, description, onPress}: DataFieldListItemProps) => {
  const styles = {
    title: {
      fontSize: 12,
    },
    description: {
      fontSize: 16,
    },
  };

  const getDescriptionElement = () => <Text selectable={true}>{description}</Text>;
  const defaultOnPress = () => console.log('booo');

  return (
    <List.Item
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      description={getDescriptionElement}
      title={title}
      onPress={onPress || defaultOnPress}
    />
  );
};
