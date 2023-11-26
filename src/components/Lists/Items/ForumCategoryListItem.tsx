import React from 'react';
import {List, Text} from 'react-native-paper';
import {commonStyles} from '../../../styles';
import {CategoryData} from '../../../libraries/Structs/ControllerStructs';
import {StyleSheet} from 'react-native';
import {ContentText} from '../../Text/ContentText';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';

interface ForumCategoryListItemProps {
  category: CategoryData;
}

export const ForumCategoryListItem = ({category}: ForumCategoryListItemProps) => {
  const forumNavigation = useForumStackNavigation();

  const styles = StyleSheet.create({
    item: {
      // ...commonStyles.paddingHorizontal,
    },
    title: commonStyles.bold,
  });

  const getThreadCount = () => <Text>{category.numThreads} threads</Text>;
  const getDescription = () => <ContentText textVariant={'bodyMedium'} text={category.purpose} />;
  const onPress = () =>
    forumNavigation.push(ForumStackComponents.forumCategoryScreen, {categoryId: category.categoryID});

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
