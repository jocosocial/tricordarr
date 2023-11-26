import React from 'react';
import {List, Text} from 'react-native-paper';
import {commonStyles} from '../../../styles';
import {CategoryData} from '../../../libraries/Structs/ControllerStructs';
import {StyleSheet} from 'react-native';
import {ContentText} from '../../Text/ContentText';

interface ForumCategoryListItemProps {
  category: CategoryData;
}

export const ForumCategoryListItem = ({category}: ForumCategoryListItemProps) => {
  const styles = StyleSheet.create({
    item: commonStyles.paddingHorizontal,
    title: commonStyles.bold,
  });

  const getThreadCount = () => <Text>{category.numThreads} threads</Text>;
  const getDescription = () => <ContentText textVariant={'bodyMedium'} text={category.purpose} />;
  const onPress = () => console.log('foo');

  return (
    <List.Item
      style={styles.item}
      title={category.title}
      titleStyle={styles.title}
      description={getDescription}
      onPress={onPress}
      right={getThreadCount}
    />
  );
};
