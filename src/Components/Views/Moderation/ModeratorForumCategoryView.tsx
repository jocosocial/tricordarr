import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Menu} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useMenu} from '#src/Hooks/useMenu';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {useForumCategoriesQuery} from '#src/Queries/Forum/ForumCategoryQueries';
import {useForumSetCategoryMutation} from '#src/Queries/Moderation/ModerationMutations';
import {ForumModerationData, ModeratorActionLogResponseData} from '#src/Structs/ControllerStructs';

interface ModeratorForumCategoryViewProps {
  forumID: string;
  currentCategoryID: string;
  isDeleted: boolean;
}

/**
 * Change-category menu for a forum thread on the moderate screen.
 */
export const ModeratorForumCategoryView = ({
  forumID,
  currentCategoryID,
  isDeleted,
}: ModeratorForumCategoryViewProps) => {
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();
  const {visible, openMenu, closeMenu} = useMenu();
  const {data: categories} = useForumCategoriesQuery();
  const setCategoryMutation = useForumSetCategoryMutation();

  const onSetCategory = (categoryID: string) => {
    closeMenu();
    setCategoryMutation.mutate(
      {forumID, categoryID},
      {
        onSuccess: async () => {
          await invalidateQueryKeys(
            queryClient,
            ForumModerationData.getCacheKeys(forumID).concat(ModeratorActionLogResponseData.getCacheKeys()),
          );
          setSnackbarPayload({message: 'Forum category updated.', messageType: 'info'});
        },
      },
    );
  };

  return (
    <PaddedContentView>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <PrimaryActionButton
            testID={'forumModerateChangeCategory-button'}
            buttonText={'Change Category'}
            buttonColor={theme.colors.twitarrNeutralButton}
            disabled={isDeleted || setCategoryMutation.isPending}
            isLoading={setCategoryMutation.isPending}
            onPress={openMenu}
          />
        }>
        {(categories ?? []).map(category => (
          <Menu.Item
            key={category.categoryID}
            dense={false}
            title={category.title}
            disabled={category.categoryID === currentCategoryID}
            onPress={() => onSetCategory(category.categoryID)}
          />
        ))}
      </Menu>
    </PaddedContentView>
  );
};
