import React from 'react';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useMenu} from '#src/Hooks/useMenu';

interface EventFeedbackLocationFilterMenuProps {
  locations: string[];
  locationName?: string;
  onLocationChange: (locationName: string | undefined) => void;
}

/**
 * Header filter for the admin feedback reports list. Rooms come from the loaded reports.
 */
export const EventFeedbackLocationFilterMenu = ({
  locations,
  locationName,
  onLocationChange,
}: EventFeedbackLocationFilterMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();

  const menuAnchor = (
    <FilterMenuAnchor active={!!locationName} onPress={openMenu} onLongPress={() => onLocationChange(undefined)} />
  );

  const handleLocationSelection = (selectedLocation: string) => {
    if (selectedLocation === locationName) {
      onLocationChange(undefined);
    } else {
      onLocationChange(selectedLocation);
    }
    closeMenu();
  };

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {locations.map(location => (
        <SelectableMenuItem
          key={location}
          title={location}
          selected={location === locationName}
          onPress={() => handleLocationSelection(location)}
        />
      ))}
    </AppMenu>
  );
};
