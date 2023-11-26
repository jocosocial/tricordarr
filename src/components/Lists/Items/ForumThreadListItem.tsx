import React from 'react';
import {Badge, List, Text} from 'react-native-paper';
import {commonStyles} from '../../../styles';
import {ForumListData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {StyleSheet, View} from 'react-native';
import pluralize from 'pluralize';
import {RelativeTimeTag} from '../../Text/RelativeTimeTag';

interface ForumThreadListItemProps {
  forumData: ForumListData;
}

export const ForumThreadListItem = ({forumData}: ForumThreadListItemProps) => {
  const styles = StyleSheet.create({
    item: {
      // ...commonStyles.paddingHorizontal,
      // ...commonStyles.paddingLeftZero,
    },
    title: commonStyles.bold,
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
  });

  const getRight = () => {
    if (forumData.readCount !== forumData.postCount) {
      const unreadCount = forumData.postCount - forumData.readCount;
      return (
        <View>
          <Badge style={styles.badge}>{`${unreadCount} new ${pluralize('post', unreadCount)}`}</Badge>
        </View>
      );
    }
  };
  const getDescription = () => (
    <View>
      <Text variant={'bodyMedium'}>
        {forumData.postCount} {pluralize('post', forumData.postCount)}
      </Text>
      <Text variant={'bodyMedium'}>
        Created <RelativeTimeTag variant={'bodyMedium'} date={new Date(forumData.createdAt)} /> by {UserHeader.getByline(forumData.creator)}
      </Text>
      {forumData.lastPostAt && (
        <Text variant={'bodyMedium'}>
          Last post <RelativeTimeTag variant={'bodyMedium'} date={new Date(forumData.lastPostAt)} />
          {forumData.lastPoster && <Text variant={'bodyMedium'}> by {UserHeader.getByline(forumData.lastPoster)}</Text>}
        </Text>
      )}
    </View>
  );
  const onPress = () => console.log('foo');

  return (
    <List.Item
      style={styles.item}
      title={forumData.title}
      titleStyle={styles.title}
      titleNumberOfLines={0}
      description={getDescription}
      onPress={onPress}
      right={getRight}
    />
  );
};
