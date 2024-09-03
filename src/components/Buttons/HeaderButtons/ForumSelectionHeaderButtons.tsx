import {MaterialHeaderButton} from '../MaterialHeaderButton.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import React, {Dispatch, SetStateAction} from 'react';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useForumRelationMutation} from '../../Queries/Forum/ForumThreadRelationMutations.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';

interface ForumSelectionHeaderButtonsProps {
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  categoryID?: string;
}

export const ForumSelectionHeaderButtons = (props: ForumSelectionHeaderButtonsProps) => {
  const {selectedItems, setEnableSelection, setSelectedItems} = useSelection<ForumListData>();
  const relationMutation = useForumRelationMutation();
  const queryClient = useQueryClient();

  const onPress = async (relation: 'mute' | 'favorite') => {
    props.setRefreshing(true);

    // https://stackoverflow.com/questions/70771324/how-to-handle-multiple-mutations-in-parallel-with-react-query
    const mutations: Promise<AxiosResponse<void, any>>[] = [];
    selectedItems.forEach(i => {
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
    // @TODO This endlessly waits if there is a problem
    await Promise.all(mutations);
    const invalidationQueryKeys = ForumListData.getForumCacheKeys(props.categoryID);
    invalidationQueryKeys.forEach(key => queryClient.invalidateQueries(key));
    setEnableSelection(false);
    setSelectedItems([]);
    props.setRefreshing(false);
  };

  return (
    <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
      <Item iconName={AppIcons.favorite} title={'Favorite'} onPress={() => onPress('favorite')} />
      <Item iconName={AppIcons.mute} title={'Mute'} onPress={() => onPress('mute')} />
    </HeaderButtons>
  );
};
