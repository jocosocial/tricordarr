import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useAppTheme} from '../../../styles/Theme';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {FezType} from '../../../libraries/Enums/FezType';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const ScheduleLfgFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const theme = useAppTheme();
  const {lfgTypeFilter, setLfgTypeFilter, lfgHidePastFilter, setLfgHidePastFilter} = useFilter();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();

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
    <Item
      title={'Filter'}
      color={anyActiveFilter ? theme.colors.twitarrNeutralButton : undefined}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={clearFilters}
    />
  );

  const filterableFezTypes = [
    FezType.activity,
    FezType.dining,
    FezType.gaming,
    FezType.meetup,
    FezType.music,
    FezType.other,
    FezType.shore,
  ];

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Hide Past'}
        onPress={handleHidePast}
        style={lfgHidePastFilter ? commonStyles.surfaceVariant : undefined}
        trailingIcon={lfgHidePastFilter ? AppIcons.check : undefined}
      />
      <Divider bold={true} />
      {filterableFezTypes.map(fezType => {
        return (
          <Menu.Item
            key={fezType}
            style={lfgTypeFilter === fezType ? commonStyles.surfaceVariant : undefined}
            title={FezType[fezType as keyof typeof FezType]}
            onPress={() => handleFilterSelection(fezType as keyof typeof FezType)}
            trailingIcon={lfgTypeFilter === fezType ? AppIcons.check : undefined}
          />
        );
      })}
    </Menu>
  );
};
