import React from 'react';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useMenu} from '#src/Hooks/useMenu';
import {usePhotostreamLocationDataQuery} from '#src/Queries/Photostream/PhotostreamQueries';

interface PhotostreamFilterMenuProps {
  locationName?: string;
  onLocationChange: (locationName: string | undefined) => void;
}

export const PhotostreamFilterMenu = ({locationName, onLocationChange}: PhotostreamFilterMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {data: locationData} = usePhotostreamLocationDataQuery();

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

  const locations = locationData?.locations || [];

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
