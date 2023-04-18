import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {FezDataProps} from '../../libraries/Types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SeamailStackScreenComponents} from '../../libraries/Enums/Navigation';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
}

export const UserProfileActionsMenu = ({profile}: UserProfileActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // const detailsAction = () => {
  //   navigation.push(SeamailStackScreenComponents.seamailDetailsScreen, {fezID: fez.fezID});
  //   closeMenu();
  // };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={<NavBarIconButton icon={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item leadingIcon={'star'} title={'Favorite'} />
      <Menu.Item leadingIcon={'note-edit'} title={'Add Private Note'} />
      <Divider bold={true} />
      <Menu.Item leadingIcon={'cancel'} title={'Block'} />
      <Menu.Item leadingIcon={'volume-off'} title={'Mute'} />
      <Menu.Item leadingIcon={'alert-octagon'} title={'Report'} />
      <Divider bold={true} />
      <Menu.Item leadingIcon={'shield-crown'} title={'Moderate'} />
    </Menu>
  );
};
