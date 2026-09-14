import {useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
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
  const {markRead, updateMute} = useFezCacheReducer();
  // Tracks the batch mutation separately from props.setRefreshing: that drives the pull-to-refresh
  // spinner on the parent list, not this button's own tappability. Without it a fast repeat tap
  // re-fires the whole batch and can flip a relation back off before the first pass lands. See #533.
  const [busy, setBusy] = useState(false);

  const markAsRead = async () => {
    setBusy(true);
    props.setRefreshing(true);
    const refetches = props.selectedItems.map(selectedItem => {
      return queryClient.refetchQueries({queryKey: [`/fez/${selectedItem.id}`]});
    });
    await Promise.allSettled(refetches);
    for (const selectedItem of props.selectedItems) {
      markRead(selectedItem.id);
    }
    props.setRefreshing(false);
    setBusy(false);
  };

  const handleMute = async () => {
    setBusy(true);
    props.setRefreshing(true);
    const mutations = props.selectedItems.map(selectedItem => {
      const sourceItem = props.items?.find(item => item.fezID === selectedItem.id);
      if (!sourceItem?.members) return Promise.resolve();
      const newMuted = !sourceItem.members.isMuted;
      const action = sourceItem.members.isMuted ? 'unmute' : 'mute';
      updateMute(sourceItem.fezID, newMuted);
      return muteMutation.mutateAsync({action, fezID: sourceItem.fezID});
    });
    await Promise.allSettled(mutations);
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
        testID={'seamailSelectionMarkRead-headerButton'}
      />
      <Item
        iconName={AppIcons.mute}
        title={'Mute'}
        onPress={handleMute}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
        testID={'seamailSelectionMute-headerButton'}
      />
    </MaterialHeaderButtons>
  );
};
