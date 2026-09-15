import {AxiosResponse} from 'axios';
import React, {useState} from 'react';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
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
  const {commonStyles} = useStyles();
  const markReadMutation = useForumMarkReadMutation();
  const {markRead, updateFavorite, updateMute} = useForumCacheReducer();
  // Tracks the batch mutation separately from props.setRefreshing: that drives the pull-to-refresh
  // spinner on the parent list, not this button's own tappability. Without it a fast repeat tap
  // re-fires the whole batch and can flip a relation back off before the first pass lands. See #533.
  const [busy, setBusy] = useState(false);

  const onPress = async (relation: 'mute' | 'favorite') => {
    setBusy(true);
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
            if (relation === 'favorite') {
              updateFavorite(sourceItem.forumID, props.categoryID, !sourceItem.isFavorite);
            } else {
              updateMute(sourceItem.forumID, props.categoryID, !sourceItem.isMuted);
            }
          },
        },
      );
      mutations.push(mutation);
    });
    await Promise.allSettled(mutations);
    props.setRefreshing(false);
    setBusy(false);
  };

  const markAsRead = async () => {
    setBusy(true);
    props.setRefreshing(true);
    const itemMutations: {id: string; mutation: Promise<AxiosResponse<void, any>>}[] = [];

    props.selectedItems.forEach(selectedItem => {
      const sourceItem = props.items?.find(item => item.forumID === selectedItem.id);
      if (!sourceItem) return;
      itemMutations.push({
        id: selectedItem.id,
        mutation: markReadMutation.mutateAsync({forumID: sourceItem.forumID}),
      });
    });
    const results = await Promise.allSettled(itemMutations.map(m => m.mutation));

    // Only update local caches for successfully settled mutations.
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        markRead(itemMutations[i].id, props.categoryID);
      }
    });
    props.setRefreshing(false);
    setBusy(false);
  };

  const disableButtons = props.selectedItems.length === 0 || busy;

  return (
    <MaterialHeaderButtons>
      <Item
        iconName={AppIcons.markAsRead}
        title={'Mark as Read'}
        onPress={markAsRead}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
        testID={'forumSelectionMarkRead-headerButton'}
      />
      <Item
        iconName={AppIcons.favorite}
        title={'Favorite'}
        onPress={() => onPress('favorite')}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
        testID={'forumSelectionFavorite-headerButton'}
      />
      <Item
        iconName={AppIcons.mute}
        title={'Mute'}
        onPress={() => onPress('mute')}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
        testID={'forumSelectionMute-headerButton'}
      />
    </MaterialHeaderButtons>
  );
};
