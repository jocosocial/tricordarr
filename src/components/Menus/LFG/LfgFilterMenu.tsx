import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {FezType} from '../../../libraries/Enums/FezType';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {SelectableMenuItem} from '../Items/SelectableMenuItem.tsx';
import {MenuAnchor} from '../MenuAnchor.tsx';

export const LfgFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const {lfgTypeFilter, setLfgTypeFilter, lfgHidePastFilter, setLfgHidePastFilter} = useFilter();
  const {appConfig} = useConfig();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleHidePast = () => {
    setLfgHidePastFilter(!lfgHidePastFilter);
    closeMenu();
  };

  const handleFilterSelection = (newValue: keyof typeof FezType) => {
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
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem title={'Hide Past'} onPress={handleHidePast} selected={lfgHidePastFilter} />
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
    </Menu>
  );
};
