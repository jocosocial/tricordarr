import {QueryKey} from '@tanstack/react-query';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Menu, Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {useMenu} from '#src/Hooks/useMenu';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {ModerationSetStatePath} from '#src/Queries/Moderation/ModerationMutations';
import {
  FezModerationData,
  FezPostModerationData,
  ForumModerationData,
  ForumPostModerationData,
  ProfileModerationData,
} from '#src/Structs/ControllerStructs';

type ModeratedContentData =
  ForumPostModerationData | ForumModerationData | FezModerationData | FezPostModerationData | ProfileModerationData;

interface ModerationStateContext {
  path: ModerationSetStatePath;
  contentID: string;
  cacheKeys: QueryKey[];
  isDeleted: boolean;
}

/**
 * Derives set-state path, content ID, and cache keys from moderate-screen data.
 */
const getModerationStateContext = (data: ModeratedContentData): ModerationStateContext => {
  if ('forumPost' in data) {
    const contentID = String(data.forumPost.postID);
    return {
      path: 'forumpost',
      contentID,
      cacheKeys: ForumPostModerationData.getCacheKeys(contentID),
      isDeleted: data.isDeleted,
    };
  }
  if ('fezPost' in data) {
    const contentID = String(data.fezPost.postID);
    return {
      path: 'fezpost',
      contentID,
      cacheKeys: FezPostModerationData.getCacheKeys(contentID, data.fezID),
      isDeleted: data.isDeleted,
    };
  }
  if ('fez' in data) {
    return {
      path: 'fez',
      contentID: data.fez.fezID,
      cacheKeys: FezModerationData.getCacheKeys(data.fez.fezID),
      isDeleted: data.isDeleted,
    };
  }
  if ('profile' in data) {
    const userID = data.profile.header?.userID;
    return {
      path: 'profile',
      contentID: userID ?? '',
      cacheKeys: ProfileModerationData.getCacheKeys(userID),
      isDeleted: false,
    };
  }
  return {
    path: 'forum',
    contentID: data.forumID,
    cacheKeys: ForumModerationData.getCacheKeys(data.forumID),
    isDeleted: data.isDeleted,
  };
};

interface ModeratorStateViewProps {
  data: ModeratedContentData;
}

/**
 * Current moderation status and Set State menu for a piece of content.
 */
export const ModeratorStateView = ({data}: ModeratorStateViewProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const context = useMemo(() => getModerationStateContext(data), [data]);
  const actions = useModerationContentActions(context.cacheKeys);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.flexColumn,
          ...commonStyles.gapSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <View style={styles.container}>
      <Text>Current State: {ContentModerationStatus.getLabel(data.moderationStatus)}</Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <PrimaryActionButton
            testID={'moderationSetState-button'}
            buttonText={'Set State'}
            buttonColor={theme.colors.twitarrNeutralButton}
            disabled={context.isDeleted || actions.isLoading}
            isLoading={actions.isLoading}
            onPress={openMenu}
          />
        }>
        {ContentModerationStatus.settableStates.map(state => (
          <Menu.Item
            key={state}
            dense={false}
            title={ContentModerationStatus.getActionLabel(state)}
            disabled={state === data.moderationStatus}
            onPress={() => {
              closeMenu();
              actions.setState(context.path, context.contentID, state);
            }}
          />
        ))}
      </Menu>
    </View>
  );
};
