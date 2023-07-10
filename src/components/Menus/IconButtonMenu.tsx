import * as React from 'react';
import {PropsWithChildren} from 'react';
import {Menu} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useMenu} from '../Context/Contexts/MenuContext';

interface IconButtonMenuProps {
  icon?: IconSource;
}

export const IconButtonMenu = ({icon = AppIcons.menu, children}: PropsWithChildren<IconButtonMenuProps>) => {
  const {menuVisible, openMenu, closeMenu} = useMenu();

  return (
    <Menu visible={menuVisible} onDismiss={closeMenu} anchor={<NavBarIconButton icon={icon} onPress={openMenu} />}>
      {children}
    </Menu>
  );
};
