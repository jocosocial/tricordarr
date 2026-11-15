import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ReloadMenuItem} from '#src/Components/Menus/Items/ReloadMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface QuartermasterListActionsMenuProps {
  onReload: () => void;
}

/**
 * Three-dots menu for the Quartermastarr list: Reload and Help.
 */
export const QuartermasterListActionsMenu = ({onReload}: QuartermasterListActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useCommonStack();

  const menuAnchor = <Item title={'Quartermastarr Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={onReload} />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => navigation.push(CommonStackComponents.quartermasterHelpScreen)}
      />
    </AppMenu>
  );
};
