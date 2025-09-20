import React, {useState} from 'react';
import {Divider} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useFilter} from '../../Context/Contexts/FilterContext.ts';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {SelectableMenuItem} from '../Items/SelectableMenuItem.tsx';
import {MenuAnchor} from '../MenuAnchor.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

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
