import React, {useMemo} from 'react';
import {View} from 'react-native';
import {Menu} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useMenu} from '#src/Hooks/useMenu';
import {ModeratedContentData, ModerationStateContext} from '#src/Libraries/Moderation/ModerationStateContext';

interface ModeratorStateViewProps {
  data: ModeratedContentData;
}

/**
 * Current moderation status and Set State menu for a piece of content.
 */
export const ModeratorStateView = ({data}: ModeratorStateViewProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {theme} = useAppTheme();
  const context = useMemo(() => ModerationStateContext.fromData(data), [data]);
  const actions = useModerationContentActions(context.cacheKeys);
  const {updateThreadVisibility} = useForumCacheReducer();

  return (
    <View>
      <DataFieldListItem
        title={'Current State'}
        description={ContentModerationStatus.getLabel(data.moderationStatus)}
      />
      <PaddedContentView>
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
                actions.setState(context.path, context.contentID, state, () => {
                  if ('forumID' in data && !('forumPost' in data)) {
                    updateThreadVisibility(data.forumID, data.categoryID, state, data.title);
                  }
                });
              }}
            />
          ))}
        </Menu>
      </PaddedContentView>
    </View>
  );
};
