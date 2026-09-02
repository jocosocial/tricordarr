import React from 'react';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';

interface EventFeedbackFilterMenuProps {
  alreadySubmitted: boolean;
  onAlreadySubmittedChange: (value: boolean) => void;
}

/**
 * Header filter for the host feedback event picker. Shows reports the current user already submitted.
 */
export const EventFeedbackFilterMenu = ({alreadySubmitted, onAlreadySubmittedChange}: EventFeedbackFilterMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();

  const menuAnchor = (
    <FilterMenuAnchor
      active={alreadySubmitted}
      onPress={openMenu}
      onLongPress={() => onAlreadySubmittedChange(false)}
    />
  );

  const handleAlreadySubmitted = () => {
    onAlreadySubmittedChange(!alreadySubmitted);
    closeMenu();
  };

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem
        title={'Already Submitted'}
        leadingIcon={AppIcons.feedback}
        selected={alreadySubmitted}
        onPress={handleAlreadySubmitted}
      />
    </AppMenu>
  );
};
