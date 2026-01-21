import React from 'react';

import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {AppIcons} from '#src/Enums/Icons';

interface FilterMenuAnchorProps {
  active?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export const FilterMenuAnchor = ({active, onPress, onLongPress}: FilterMenuAnchorProps) => {
  return (
    <MenuAnchor
      title={'Filter'}
      active={active}
      iconName={active ? AppIcons.filterActive : AppIcons.filter}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
};
