import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {PersonalEventDeleteModal} from '../../Views/Modals/PersonalEventDeleteModal.tsx';
import {useScheduleStackNavigation} from '../../Navigation/Stacks/ScheduleStackNavigator.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {FezCancelModal} from '../../Views/Modals/FezCancelModal.tsx';

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
