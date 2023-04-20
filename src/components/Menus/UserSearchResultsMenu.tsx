import * as React from 'react';
import {Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {FezDataProps} from '../../libraries/Types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SeamailStackScreenComponents} from '../../libraries/Enums/Navigation';
import {AppIcons} from '../../libraries/Enums/Icons';
import {UserHeader} from '../../libraries/Structs/ControllerStructs';
import {useEffect} from 'react';

interface UserSearchResultsMenuProps {
  users?: UserHeader[];
  menuRef?: any;
}

export const UserSearchResultsMenu = ({users, menuRef}: UserSearchResultsMenuProps) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // useEffect(() => {
  //   console.log('Considering');
  //   if (users && users.length >= 2) {
  //     console.log('Open SESAME!');
  //     openMenu();
  //   }
  // }, [users]);

  console.log(users);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={menuRef}>
      {users && users.flatMap(user => <Menu.Item title={user.username} />)}
      <Menu.Item title="Person!" />
    </Menu>
  );
};
