import {useQueryClient} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import React, {Dispatch, SetStateAction} from 'react';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumRelationMutation} from '#src/Queries/Forum/ForumThreadRelationMutations';
import {ForumListDataSelectionActions} from '#src/Reducers/Forum/ForumListDataSelectionReducer';
import {ForumListData} from '#src/Structs/ControllerStructs';

interface ForumSelectionHeaderButtonsProps {
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  categoryID?: string;
}

export const ForumSelectionHeaderButtons = (props: ForumSelectionHeaderButtonsProps) => {
  const {selectedItems: selectedForums, dispatchSelectedItems: dispatchSelectedForums} = useSelection();
  const relationMutation = useForumRelationMutation();
  const queryClient = useQueryClient();

  const onPress = async (relation: 'mute' | 'favorite') => {
    props.setRefreshing(true);

    // https://stackoverflow.com/questions/70771324/how-to-handle-multiple-mutations-in-parallel-with-react-query
    const mutations: Promise<AxiosResponse<void, any>>[] = [];
    selectedForums.forEach(i => {
      const relationStatus = relation === 'favorite' ? i.isFavorite : i.isMuted;
      const mutation = relationMutation.mutateAsync(
        {
          forumID: i.forumID,
          relationType: relation,
          action: relationStatus ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [`/forum/${i.forumID}`]});
          },
        },
      );
      mutations.push(mutation);
    });
    await Promise.allSettled(mutations);
    selectedForums.forEach(i => {
      dispatchSelectedForums({
        type: ForumListDataSelectionActions.updateItem,
        item: {
          ...i,
          ...(relation === 'favorite' ? {isFavorite: !i.isFavorite} : {isMuted: !i.isMuted}),
        },
      });
    });
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
