import {useQueryClient} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import React, {Dispatch, SetStateAction} from 'react';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumRelationMutation} from '#src/Queries/Forum/ForumThreadRelationMutations';
import {ForumListData} from '#src/Structs/ControllerStructs';

interface ForumSelectionHeaderButtonsProps {
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  categoryID?: string;
  items?: ForumListData[];
}

export const ForumSelectionHeaderButtons = (props: ForumSelectionHeaderButtonsProps) => {
  const {selectedItems} = useSelection();
  const relationMutation = useForumRelationMutation();
  const queryClient = useQueryClient();

  const onPress = async (relation: 'mute' | 'favorite') => {
    props.setRefreshing(true);

    // https://stackoverflow.com/questions/70771324/how-to-handle-multiple-mutations-in-parallel-with-react-query
    const mutations: Promise<AxiosResponse<void, any>>[] = [];
    selectedItems.forEach(selectedItem => {
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

  return (
    <MaterialHeaderButtons>
      <Item iconName={AppIcons.favorite} title={'Favorite'} onPress={() => onPress('favorite')} />
      <Item iconName={AppIcons.mute} title={'Mute'} onPress={() => onPress('mute')} />
    </MaterialHeaderButtons>
  );
};
