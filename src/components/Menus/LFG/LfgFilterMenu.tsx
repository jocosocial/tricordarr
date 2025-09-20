import React, {useState} from 'react';
import {Divider} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {useFilter} from '#src/Components/Context/Contexts/FilterContext.ts';
import {FezType} from '#src/Libraries/Enums/FezType.ts';
import {useConfig} from '#src/Components/Context/Contexts/ConfigContext.ts';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem.tsx';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor.tsx';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu.tsx';

interface LfgFilterMenuProps {
  showTypes?: boolean;
}

export const LfgFilterMenu = ({showTypes = true}: LfgFilterMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {lfgTypeFilter, setLfgTypeFilter, lfgHidePastFilter, setLfgHidePastFilter} = useFilter();
  const {appConfig} = useConfig();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
  };

  const anyActiveFilter = lfgTypeFilter || lfgHidePastFilter;

  const menuAnchor = (
    <MenuAnchor
      title={'Filter'}
      active={!!anyActiveFilter}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  return (
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
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
    </AppHeaderMenu>
  );
};
