import pluralize from 'pluralize';
import React, {Dispatch, memo, SetStateAction} from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Text} from 'react-native-paper';

import {ForumNewBadge} from '#src/Components/Badges/ForumNewBadge';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {ListItem} from '#src/Components/Lists/ListItem';
import {ForumThreadListItemSwipeable} from '#src/Components/Swipeables/ForumThreadListItemSwipeable';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SelectionActions} from '#src/Context/Reducers/SelectionReducer';
import {AppIcons} from '#src/Enums/Icons';
import {getEventTimeString} from '#src/Libraries/DateTime';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useForumStackNavigation} from '#src/Navigation/Stacks/ForumStackNavigator';
import {ForumListData} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

interface ForumThreadListItemProps {
  forumListData: ForumListData;
  categoryID?: string;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
  selected: boolean;
}

const ForumThreadListInternal = ({
  forumListData,
  categoryID,
  // onSelect,
  enableSelection = false,
  selected = false,
  setEnableSelection,
}: ForumThreadListItemProps) => {
  const forumNavigation = useForumStackNavigation();
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {dispatchSelectedItems} = useSelection();

  const styles = StyleSheet.create({
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
    leftContainer: {
      ...commonStyles.flexColumn,
      ...commonStyles.justifyCenter,
    },
  });

  const getRight = () => {
    const unreadCount = forumListData.postCount - forumListData.readCount;
    if (
      unreadCount ||
      forumListData.isFavorite ||
      forumListData.isMuted ||
      forumListData.isLocked ||
      forumListData.isPinned
    ) {
      return (
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            {unreadCount !== 0 && !forumListData.isMuted && <ForumNewBadge unreadCount={unreadCount} unit={'post'} />}
            {forumListData.isFavorite && <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />}
            {forumListData.isMuted && <AppIcon icon={AppIcons.mute} color={theme.colors.twitarrNegativeButton} />}
            {forumListData.isLocked && <AppIcon icon={AppIcons.locked} color={theme.colors.twitarrNegativeButton} />}
            {forumListData.isPinned && <AppIcon icon={AppIcons.pin} />}
          </View>
        </View>
      );
    }
  };

  const getDescription = () => (
    <View>
      {forumListData.eventTime && (
        <Text variant={'bodyMedium'}>{getEventTimeString(forumListData.eventTime, forumListData.timeZoneID)}</Text>
      )}
      <Text variant={'bodyMedium'}>
        {forumListData.postCount} {pluralize('post', forumListData.postCount)}
      </Text>
      <Text variant={'bodyMedium'}>
        Created <RelativeTimeTag date={new Date(forumListData.createdAt)} variant={'bodyMedium'} /> by{' '}
        <UserBylineTag user={forumListData.creator} includePronoun={false} variant={'bodyMedium'} />
      </Text>
      {forumListData.lastPostAt && (
        <Text variant={'bodyMedium'}>
          Last post <RelativeTimeTag date={new Date(forumListData.lastPostAt)} variant={'bodyMedium'} />
          {forumListData.lastPoster && (
            <UserBylineTag
              user={forumListData.lastPoster}
              includePronoun={false}
              variant={'bodyMedium'}
              prefix={' by'}
            />
          )}
        </Text>
      )}
    </View>
  );

  const onPress = () => {
    forumNavigation.push(CommonStackComponents.forumThreadScreen, {
      forumID: forumListData.forumID,
      forumListData: forumListData,
    });
  };

  const handleSelection = () => {
    dispatchSelectedItems({
      type: SelectionActions.select,
      item: Selectable.fromForumListData(forumListData),
    });
  };

  const getLeft = () => {
    return (
      <View style={styles.leftContainer}>
        <Checkbox status={selected ? 'checked' : 'unchecked'} onPress={handleSelection} />
      </View>
    );
  };

  const onLongPress = () => {
    setEnableSelection(true);
    handleSelection();
  };

  return (
    <ForumThreadListItemSwipeable forumListData={forumListData} categoryID={categoryID} enabled={!enableSelection}>
      <ListItem
        style={styles.item}
        title={forumListData.title}
        titleStyle={styles.title}
        titleNumberOfLines={0}
        description={getDescription}
        onPress={enableSelection ? handleSelection : onPress}
        right={getRight}
        left={enableSelection ? getLeft : undefined}
        onLongPress={onLongPress}
        contentStyle={styles.content}
      />
    </ForumThreadListItemSwipeable>
  );
};

export const ForumThreadListItem = memo(ForumThreadListInternal);
