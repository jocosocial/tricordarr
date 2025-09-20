import {FezData} from '#src/Structs/ControllerStructs';
import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '#src/Enums/Icons';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {PersonalEventDeleteModal} from '#src/Components/Views/Modals/PersonalEventDeleteModal';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezType} from '#src/Enums/FezType';
import {FezCancelModal} from '#src/Components/Views/Modals/FezCancelModal';

interface PersonalEventScreenActionsMenuProps {
  event: FezData;
}

export const PersonalEventScreenActionsMenu = (props: PersonalEventScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {data: profilePublicData} = useUserProfileQuery();
  const {setModalContent, setModalVisible} = useModal();
  const navigation = useScheduleStackNavigation();
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {props.event.owner.userID === profilePublicData?.header.userID && (
        <>
          {props.event.fezType === FezType.personalEvent ? (
            <Menu.Item
              leadingIcon={AppIcons.delete}
              title={'Delete'}
              onPress={() => handleModal(<PersonalEventDeleteModal personalEvent={props.event} />)}
            />
          ) : (
            <Menu.Item
              leadingIcon={AppIcons.cancel}
              title={'Cancel'}
              onPress={() => handleModal(<FezCancelModal fezData={props.event} />)}
              disabled={props.event.cancelled}
            />
          )}
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView fez={props.event} />)}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.scheduleHelpScreen);
        }}
      />
    </AppHeaderMenu>
  );
};
