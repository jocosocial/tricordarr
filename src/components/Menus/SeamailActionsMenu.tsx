import * as React from 'react';
import {Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/NavBarIconButton';
import {FezDataProps} from '../../libraries/Types';

export const SeamailActionsMenu = ({fez}: FezDataProps) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<NavBarIconButton icon={'dots-vertical'} onPress={openMenu} />}>
      <Menu.Item onPress={() => console.log(fez.fezID)} title="Print ID" />
    </Menu>
  );
};
