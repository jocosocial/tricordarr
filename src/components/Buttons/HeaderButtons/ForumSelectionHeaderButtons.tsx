import {MaterialHeaderButton} from '../MaterialHeaderButton.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import React from 'react';

export const ForumSelectionHeaderButtons = () => {
  return (
    <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
      <Item iconName={AppIcons.favorite} title={'Favorite'} />
      <Item iconName={AppIcons.mute} title={'Mute'} />
      <Item iconName={AppIcons.markAsRead} title={'Read'} />
    </HeaderButtons>
  );
};
