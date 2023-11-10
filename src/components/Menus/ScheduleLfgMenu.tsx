import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useScheduleStack} from '../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleStackComponents} from '../../libraries/Enums/Navigation';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {Linking} from 'react-native';
import {FezData} from '../../libraries/Structs/ControllerStructs';
import {ReportModalView} from '../Views/Modals/ReportModalView';
import {useModal} from '../Context/Contexts/ModalContext';
import {LfgCancelModal} from '../Views/Modals/LfgCancelModal';
import {useUserData} from '../Context/Contexts/UserDataContext';

export const ScheduleLfgMenu = ({fezData}: {fezData: FezData}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useScheduleStack();
  const {hasModerator} = usePrivilege();
  const {setModalContent, setModalVisible} = useModal();
  const {profilePublicData} = useUserData();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'LFG Menu'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (screen: ScheduleStackComponents) => {
    navigation.push(screen);
    closeMenu();
  };

  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {fezData.owner.userID === profilePublicData?.header.userID && (
        <Menu.Item
          leadingIcon={AppIcons.cancel}
          title={'Cancel'}
          onPress={() => handleModal(<LfgCancelModal fezData={fezData} />)}
          disabled={fezData.cancelled}
        />
      )}
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView fez={fezData} />)}
      />
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
