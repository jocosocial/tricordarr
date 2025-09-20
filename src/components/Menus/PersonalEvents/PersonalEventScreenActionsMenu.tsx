import {FezData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView.tsx';
import {useModal} from '#src/Components/Context/Contexts/ModalContext.ts';
import {PersonalEventDeleteModal} from '#src/Components/Views/Modals/PersonalEventDeleteModal.tsx';
import {useScheduleStackNavigation} from '#src/Components/Navigation/Stacks/ScheduleStackNavigator.tsx';
import {CommonStackComponents} from '#src/Components/Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu.tsx';
import {useUserProfileQuery} from '#src/Components/Queries/User/UserQueries.ts';
import {FezType} from '#src/Libraries/Enums/FezType.ts';
import {FezCancelModal} from '#src/Components/Views/Modals/FezCancelModal.tsx';

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
