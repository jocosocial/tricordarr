import {PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React from 'react';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {useUserData} from '../../Context/Contexts/UserDataContext.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {PersonalEventDeleteModal} from '../../Views/Modals/PersonalEventDeleteModal.tsx';
import {useEventStackNavigation} from '../../Navigation/Stacks/EventStackNavigator.tsx';
import {EventStackComponents} from '../../../libraries/Enums/Navigation.ts';

interface PersonalEventScreenActionsMenuProps {
  event: PersonalEventData;
}

export const PersonalEventScreenActionsMenu = (props: PersonalEventScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {profilePublicData} = useUserData();
  const {setModalContent, setModalVisible} = useModal();
  const navigation = useEventStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {props.event.owner.userID === profilePublicData?.header.userID && (
        <Menu.Item
          leadingIcon={AppIcons.delete}
          title={'Delete'}
          onPress={() => handleModal(<PersonalEventDeleteModal personalEvent={props.event} />)}
        />
      )}
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView personalEvent={props.event} />)}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(EventStackComponents.personalEventHelpScreen);
        }}
      />
    </Menu>
  );
};
