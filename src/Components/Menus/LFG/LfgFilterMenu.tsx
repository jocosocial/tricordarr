import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useLfgFilter} from '#src/Context/Contexts/LfgFilterContext';
import {FezType} from '#src/Enums/FezType';
import {useMenu} from '#src/Hooks/useMenu';

interface LfgFilterMenuProps {
  showTypes?: boolean;
  enableUnread?: boolean;
}

export const LfgFilterMenu = ({showTypes = true, enableUnread = false}: LfgFilterMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {lfgTypeFilter, setLfgTypeFilter, lfgHidePastFilter, setLfgHidePastFilter, lfgOnlyNew, setLfgOnlyNew} =
    useLfgFilter();
  const {appConfig} = useConfig();

  const handleUnreadOnly = () => {
    setLfgOnlyNew(prev => (prev === true ? undefined : true));
    closeMenu();
  };

  const handleHidePast = () => {
    setLfgHidePastFilter(!lfgHidePastFilter);
    closeMenu();
  };

  const handleFilterSelection = (newValue: FezType) => {
    if (newValue === lfgTypeFilter) {
      setLfgTypeFilter(undefined);
    } else {
      setLfgTypeFilter(newValue);
    }
    closeMenu();
  };

  const clearFilters = () => {
    setLfgTypeFilter(undefined);
    setLfgHidePastFilter(appConfig.schedule.hidePastLfgs);
    setLfgOnlyNew(undefined);
  };

  const anyActiveFilter = lfgTypeFilter || lfgHidePastFilter || lfgOnlyNew === true;

  const menuAnchor = <FilterMenuAnchor active={!!anyActiveFilter} onPress={openMenu} onLongPress={clearFilters} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {enableUnread && <SelectableMenuItem title={'Unread'} onPress={handleUnreadOnly} selected={lfgOnlyNew} />}
      <SelectableMenuItem title={'Hide Past'} onPress={handleHidePast} selected={lfgHidePastFilter} />
      {showTypes && (
        <>
          <Divider bold={true} />
          {FezType.lfgTypes.map(fezType => {
            return (
              <SelectableMenuItem
                key={fezType}
                selected={lfgTypeFilter === fezType}
                title={FezType.getLabel(fezType)}
                onPress={() => handleFilterSelection(fezType)}
              />
            );
          })}
        </>
      )}
    </AppMenu>
  );
};
