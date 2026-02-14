import {QueryKey, useQueryClient} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {SetRefreshing} from '#src/Hooks/useRefresh';
import {useForumMarkReadMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {useForumRelationMutation} from '#src/Queries/Forum/ForumThreadRelationMutations';
import {ForumListData} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

interface ForumSelectionHeaderButtonsProps {
  setRefreshing: SetRefreshing;
  categoryID?: string;
  items?: ForumListData[];
  selectedItems: Selectable[];
}

export const ForumSelectionHeaderButtons = (props: ForumSelectionHeaderButtonsProps) => {
  const relationMutation = useForumRelationMutation();
  const queryClient = useQueryClient();
  const {commonStyles} = useStyles();
  const markReadMutation = useForumMarkReadMutation();

  const onPress = async (relation: 'mute' | 'favorite') => {
    props.setRefreshing(true);

    // https://stackoverflow.com/questions/70771324/how-to-handle-multiple-mutations-in-parallel-with-react-query
    const mutations: Promise<AxiosResponse<void, any>>[] = [];
    props.selectedItems.forEach(selectedItem => {
      const sourceItem = props.items?.find(item => item.forumID === selectedItem.id);
      if (!sourceItem) return;
      const relationStatus = relation === 'favorite' ? sourceItem.isFavorite : sourceItem.isMuted;
      const mutation = relationMutation.mutateAsync(
        {
          forumID: sourceItem.forumID,
          relationType: relation,
          action: relationStatus ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [`/forum/${selectedItem.id}`]});
          },
        },
      );
      mutations.push(mutation);
    });
    await Promise.allSettled(mutations);
    const invalidationQueryKeys = ForumListData.getCacheKeys(props.categoryID);
    invalidationQueryKeys.forEach(key => queryClient.invalidateQueries({queryKey: key}));
    props.setRefreshing(false);
  };

  const markAsRead = async () => {
    props.setRefreshing(true);
    const mutations: Promise<AxiosResponse<void, any>>[] = [];
    const invalidationQueryKeysSet = new Set<string>();

    // Collect all keys upfront for all selected forums
    props.selectedItems.forEach(selectedItem => {
      const sourceItem = props.items?.find(item => item.forumID === selectedItem.id);
      if (!sourceItem) return;
      const keys = ForumListData.getCacheKeys(props.categoryID, sourceItem.forumID);
      // Serialize keys to strings for deduplication
      keys.forEach(key => {
        invalidationQueryKeysSet.add(JSON.stringify(key));
      });
    });

    // Execute all mutations
    props.selectedItems.forEach(selectedItem => {
      const sourceItem = props.items?.find(item => item.forumID === selectedItem.id);
      if (!sourceItem) return;
      const mutation = markReadMutation.mutateAsync({
        forumID: sourceItem.forumID,
      });
      mutations.push(mutation);
    });
    await Promise.allSettled(mutations);

    // Deduplicate and invalidate all unique keys
    const uniqueKeys: QueryKey[] = Array.from(invalidationQueryKeysSet).map(keyStr => JSON.parse(keyStr));
    uniqueKeys.forEach(key => queryClient.invalidateQueries({queryKey: key}));
    props.setRefreshing(false);
  };

  const disableButtons = props.selectedItems.length === 0;

  return (
    <MaterialHeaderButtons>
      <Item
        iconName={AppIcons.markAsRead}
        title={'Mark as Read'}
        onPress={markAsRead}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
      />
      <Item
        iconName={AppIcons.favorite}
        title={'Favorite'}
        onPress={() => onPress('favorite')}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
      />
      <Item
        iconName={AppIcons.mute}
        title={'Mute'}
        onPress={() => onPress('mute')}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
      />
    </MaterialHeaderButtons>
  );
};
