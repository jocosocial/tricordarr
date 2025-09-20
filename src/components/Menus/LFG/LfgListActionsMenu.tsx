import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '#src/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {LfgStackComponents, useLFGStackNavigation, useLFGStackRoute} from '#src/Navigation/Stacks/LFGStackNavigator';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';

export const LfgListActionsMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useLFGStackNavigation();
  const route = useLFGStackRoute();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Schedule Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (screen: LfgStackComponents | CommonStackComponents) => {
    if (route.name === screen) {
      closeMenu();
      return;
    }
    navigation.push(screen);
    closeMenu();
  };

  return (
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {route.name !== LfgStackComponents.lfgFormerScreen && (
        <>
          <Menu.Item
            leadingIcon={AppIcons.lfgFormer}
            title={'Former LFGs'}
            onPress={() => handleNavigation(LfgStackComponents.lfgFormerScreen)}
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() => handleNavigation(LfgStackComponents.lfgSettingsScreen)}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => handleNavigation(CommonStackComponents.lfgHelpScreen)}
      />
    </AppHeaderMenu>
  );
};
