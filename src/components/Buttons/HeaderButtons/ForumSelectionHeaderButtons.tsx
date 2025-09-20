import {MaterialHeaderButton} from '../MaterialHeaderButton.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import React, {Dispatch, SetStateAction} from 'react';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';
import {ForumListData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useForumRelationMutation} from '../../Queries/Forum/ForumThreadRelationMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import {ForumListDataSelectionActions} from '../../Reducers/Forum/ForumListDataSelectionReducer.ts';

interface ForumSelectionHeaderButtonsProps {
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  categoryID?: string;
}

export const ForumSelectionHeaderButtons = (props: ForumSelectionHeaderButtonsProps) => {
  const {selectedForums, dispatchSelectedForums} = useSelection();
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
            queryClient.invalidateQueries([`/forum/${i.forumID}`]);
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
    invalidationQueryKeys.forEach(key => queryClient.invalidateQueries(key));
    props.setRefreshing(false);
  };

  return (
    <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
      <Item iconName={AppIcons.favorite} title={'Favorite'} onPress={() => onPress('favorite')} />
      <Item iconName={AppIcons.mute} title={'Mute'} onPress={() => onPress('mute')} />
    </HeaderButtons>
  );
};
