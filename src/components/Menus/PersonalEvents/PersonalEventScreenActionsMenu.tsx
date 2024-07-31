import {PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React from 'react';
import {HelpMenuItem} from '../Items/HelpMenuItem';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {useUserData} from '../../Context/Contexts/UserDataContext.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {PersonalEventDeleteModal} from '../../Views/Modals/PersonalEventDeleteModal.tsx';

interface PersonalEventScreenActionsMenuProps {
  event: PersonalEventData;
}

const helpContent = [
  'Personal events are not a way to reserve space.',
  'Confirm that the time your event is shown in Twitarr makes sense with the ships clocks.',
];

export const PersonalEventScreenActionsMenu = (props: PersonalEventScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {profilePublicData} = useUserData();
  const {setModalContent, setModalVisible} = useModal();

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
      <HelpMenuItem closeMenu={closeMenu} helpContent={helpContent} />
    </Menu>
  );
};
