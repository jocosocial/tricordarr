import * as React from 'react';
import {Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {FezDataProps} from '../../libraries/Types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SeamailStackScreenComponents} from '../../libraries/Enums/Navigation';

export const SeamailActionsMenu = ({fez}: FezDataProps) => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const detailsAction = () => {
    navigation.push(SeamailStackScreenComponents.seamailDetailsScreen, {fezID: fez.fezID});
    closeMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<NavBarIconButton icon={'dots-vertical'} onPress={openMenu} />}>
      <Menu.Item onPress={detailsAction} title="Seamail Details" />
    </Menu>
  );
};
