import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useScheduleStack} from '../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleStackComponents} from '../../libraries/Enums/Navigation';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {Linking} from 'react-native';
import {FezData} from '../../libraries/Structs/ControllerStructs';

export const ScheduleLfgMenu = ({fezData}: {fezData: FezData}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useScheduleStack();
  const {hasModerator} = usePrivilege();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'LFG Menu'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (screen: ScheduleStackComponents) => {
    navigation.push(screen);
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {hasModerator && (
        <Menu.Item
          leadingIcon={AppIcons.moderator}
          title={'Moderate'}
          onPress={() => {
            console.warn('@TODO');
            // Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/moderate/fez/${fezData.fezID}`);
            closeMenu();
          }}
        />
      )}
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => handleNavigation(ScheduleStackComponents.lfgHelpScreen)}
      />
    </Menu>
  );
};
