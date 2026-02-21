import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {SetRefreshing} from '#src/Hooks/useRefresh';
import {useFezMuteMutation} from '#src/Queries/Fez/FezMuteMutations';
import {FezData} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

interface SeamailSelectionHeaderButtonsProps {
  setRefreshing: SetRefreshing;
  items?: FezData[];
  selectedItems: Selectable[];
}

export const SeamailSelectionHeaderButtons = (props: SeamailSelectionHeaderButtonsProps) => {
  const {commonStyles} = useStyles();
  const muteMutation = useFezMuteMutation();
  const queryClient = useQueryClient();

  const markAsRead = async () => {
    props.setRefreshing(true);
    const refetches = props.selectedItems.map(selectedItem => {
      return queryClient.refetchQueries({queryKey: [`/fez/${selectedItem.id}`]});
    });
    await Promise.allSettled(refetches);
    const invalidations = FezData.getCacheKeys().map(key => {
      return queryClient.invalidateQueries({queryKey: key});
    });
    await Promise.all(invalidations);
    props.setRefreshing(false);
  };

  const handleMute = async () => {
    props.setRefreshing(true);
    const mutations = props.selectedItems.map(selectedItem => {
      const sourceItem = props.items?.find(item => item.fezID === selectedItem.id);
      if (!sourceItem?.members) return Promise.resolve();
      const action = sourceItem.members.isMuted ? 'unmute' : 'mute';
      return muteMutation.mutateAsync(
        {action, fezID: sourceItem.fezID},
        {
          onSuccess: async () => {
            const itemInvalidations = FezData.getCacheKeys(sourceItem.fezID).map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(itemInvalidations);
          },
        },
      );
    });
    await Promise.allSettled(mutations);
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
        iconName={AppIcons.mute}
        title={'Mute'}
        onPress={handleMute}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
      />
    </MaterialHeaderButtons>
  );
};
