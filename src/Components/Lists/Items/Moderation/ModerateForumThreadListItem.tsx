import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {ListItem} from '#src/Components/Lists/ListItem';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {AppIcons} from '#src/Enums/Icons';
import {ForumModerationData} from '#src/Structs/ControllerStructs';

interface ModerateForumThreadListItemProps {
  data: ForumModerationData;
  categoryTitle?: string;
}

/**
 * Forum-thread preview for the moderate-forum screen. Mirrors ForumThreadListItem
 * for title, created-by, and locked state using the fields moderation data provides.
 * Title is the original from `/mod/forum/{id}`, not the public placeholder used
 * when a thread is quarantined.
 */
export const ModerateForumThreadListItem = ({data, categoryTitle}: ModerateForumThreadListItemProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          backgroundColor: theme.colors.background,
          ...commonStyles.paddingRightSmall,
        },
        content: {
          ...commonStyles.paddingLeftSmall,
        },
        title: commonStyles.bold,
        rightContainer: {
          ...commonStyles.marginLeftSmall,
        },
        rightContent: {
          ...commonStyles.flexColumn,
          ...commonStyles.alignItemsEnd,
        },
      }),
    [commonStyles, theme.colors.background],
  );

  const getRight = () => {
    if (data.moderationStatus === ContentModerationStatus.locked) {
      return (
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            <AppIcon icon={AppIcons.locked} color={theme.colors.twitarrNegativeButton} />
          </View>
        </View>
      );
    }
  };

  const getDescription = () => (
    <View>
      <Text variant={'bodyMedium'}>{categoryTitle ?? data.categoryID}</Text>
      <Text variant={'bodyMedium'}>
        Created <RelativeTimeTag date={new Date(data.createdAt)} variant={'bodyMedium'} /> by{' '}
        <UserBylineTag user={data.creator} includePronoun={false} variant={'bodyMedium'} />
      </Text>
    </View>
  );

  return (
    <ListItem
      style={styles.item}
      title={data.title}
      titleStyle={styles.title}
      titleNumberOfLines={0}
      description={getDescription}
      right={getRight}
      contentStyle={styles.content}
    />
  );
};
