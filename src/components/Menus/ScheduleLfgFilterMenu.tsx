import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useAppTheme} from '../../styles/Theme';
import {useScheduleFilter} from '../Context/Contexts/ScheduleFilterContext';
import {ViewStyle} from 'react-native';
import {FezType} from '../../libraries/Enums/FezType';
import {useConfig} from '../Context/Contexts/ConfigContext';

export const ScheduleLfgFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const theme = useAppTheme();
  const {lfgTypeFilter, setLfgTypeFilter, lfgHidePastFilter, setLfgHidePastFilter} = useScheduleFilter();
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
    setLfgHidePastFilter(appConfig.hidePastLfgs);
  };

  const anyActiveFilter = lfgTypeFilter || lfgHidePastFilter;

  const menuAnchor = (
    <Item
      title={'Filter'}
      color={anyActiveFilter ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  const activeStyle: ViewStyle = {backgroundColor: theme.colors.surfaceVariant};

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item title={'Hide Past'} onPress={handleHidePast} style={lfgHidePastFilter ? activeStyle : undefined} />
      <Divider bold={true} />
      {Object.keys(FezType).map(fezType => {
        if (
          FezType[fezType as keyof typeof FezType] === FezType.open ||
          FezType[fezType as keyof typeof FezType] === FezType.closed
        ) {
          return;
        }
        const itemStyle = lfgTypeFilter === fezType ? activeStyle : undefined;
        return (
          <Menu.Item
            key={fezType}
            style={itemStyle}
            title={FezType[fezType as keyof typeof FezType]}
            onPress={() => handleFilterSelection(fezType as keyof typeof FezType)}
          />
        );
      })}
    </Menu>
  );
};
