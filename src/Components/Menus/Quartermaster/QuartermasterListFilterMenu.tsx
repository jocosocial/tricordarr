import React from 'react';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useQuartermasterFilter} from '#src/Context/Contexts/QuartermasterFilterContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';

/**
 * Filter menu for the Quartermastarr list. "My Items" narrows whichever of Have/Need is
 * selected to the current user's own items. Picking a filter dismisses the menu; long-pressing
 * the anchor clears the filters.
 */
export const QuartermasterListFilterMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {quartermasterMine, setQuartermasterMine, clearQuartermasterFilters, anyQuartermasterFilterActive} =
    useQuartermasterFilter();

  const handleMine = () => {
    setQuartermasterMine(!quartermasterMine);
    closeMenu();
  };

  const menuAnchor = (
    <FilterMenuAnchor
      active={anyQuartermasterFilterActive}
      onPress={openMenu}
      onLongPress={clearQuartermasterFilters}
    />
  );

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem
        leadingIcon={AppIcons.profile}
        title={'My Items'}
        selected={quartermasterMine}
        onPress={handleMine}
      />
    </AppMenu>
  );
};
