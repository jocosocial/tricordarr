import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserCacheReducer} from '#src/Hooks/User/useUserCacheReducer';
import {SetRefreshing} from '#src/Hooks/useRefresh';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useUserBlockMutation} from '#src/Queries/Users/UserBlockMutations';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {USER_RELATION_ACTIONS, type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

interface UserListSelectionHeaderButtonsProps {
  mode: UserRelationMode;
  items: UserHeader[];
  selectedItems: Selectable[];
  setRefreshing: SetRefreshing;
}

export const UserListSelectionHeaderButtons = (props: UserListSelectionHeaderButtonsProps) => {
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();
  const {removeRelation} = useUserCacheReducer();
  const favoriteMutation = useUserFavoriteMutation();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const {preRegistrationMode} = usePreRegistration();

  const resolveUserHeaders = (): UserHeader[] =>
    props.selectedItems
      .map(selected => props.items.find(item => item.userID === selected.id))
      .filter((h): h is UserHeader => h !== undefined);

  const handleRemove = async () => {
    props.setRefreshing(true);
    const itemsToRemove: UserHeader[] = [];
    const mutations = props.selectedItems.map(selectedItem => {
      const sourceItem = props.items.find(item => item.userID === selectedItem.id);
      if (!sourceItem) return Promise.resolve();
      itemsToRemove.push(sourceItem);
      const removeAction = USER_RELATION_ACTIONS[props.mode].remove;
      if (props.mode === 'favorite') {
        return favoriteMutation.mutateAsync({action: removeAction as 'unfavorite', userID: sourceItem.userID});
      } else if (props.mode === 'mute') {
        return muteMutation.mutateAsync({action: removeAction as 'unmute', userID: sourceItem.userID});
      } else {
        return blockMutation.mutateAsync({action: removeAction as 'unblock', userID: sourceItem.userID});
      }
    });
    const results = await Promise.allSettled(mutations);
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && itemsToRemove[i]) {
        removeRelation(props.mode, itemsToRemove[i]);
      }
    });
    props.setRefreshing(false);
  };

  const handleSeamail = () => {
    commonNavigation.push(CommonStackComponents.seamailCreateScreen, {
      initialUserHeaders: resolveUserHeaders(),
    });
  };

  const handleEvent = () => {
    commonNavigation.push(CommonStackComponents.personalEventCreateScreen, {
      initialUserHeaders: resolveUserHeaders(),
    });
  };

  const disableButtons = props.selectedItems.length === 0;

  return (
    <MaterialHeaderButtons>
      {!preRegistrationMode && props.mode === 'favorite' && (
        <>
          <Item
            iconName={AppIcons.seamail}
            title={'Seamail'}
            onPress={handleSeamail}
            disabled={disableButtons}
            style={disableButtons ? commonStyles.disabled : undefined}
          />
          <Item
            iconName={AppIcons.eventCreate}
            title={'Event'}
            onPress={handleEvent}
            disabled={disableButtons}
            style={disableButtons ? commonStyles.disabled : undefined}
          />
        </>
      )}
      <Item
        iconName={AppIcons.delete}
        title={'Remove'}
        onPress={handleRemove}
        disabled={disableButtons}
        style={disableButtons ? commonStyles.disabled : undefined}
      />
    </MaterialHeaderButtons>
  );
};
