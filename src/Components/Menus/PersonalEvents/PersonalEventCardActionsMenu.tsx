import React, {Dispatch, ReactNode, SetStateAction} from 'react';
import {Divider, Menu} from 'react-native-paper';

import {PersonalEventDeleteModal} from '#src/Components/Views/Modals/PersonalEventDeleteModal';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface PersonalEventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: FezData;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const PersonalEventCardActionsMenu = (props: PersonalEventCardActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {data: profilePublicData} = useUserProfileQuery();
  const {setModalContent, setModalVisible} = useModal();
  const navigation = useCommonStack();

  const anchorWithMenu = React.cloneElement(props.anchor, {
    onLongPress: openMenu,
  });

  const handleModal = (content: ReactNode) => {
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchorWithMenu}>
      <Menu.Item
        leadingIcon={AppIcons.calendarMultiple}
        title={'Overlapping'}
        onPress={() => navigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: props.eventData})}
      />
      {props.eventData.owner.userID === profilePublicData?.header.userID && (
        <>
          <Menu.Item
            leadingIcon={AppIcons.edit}
            title={'Edit'}
            onPress={() =>
              navigation.push(CommonStackComponents.personalEventEditScreen, {
                personalEvent: props.eventData,
              })
            }
          />
          <Menu.Item
            leadingIcon={AppIcons.delete}
            title={'Delete'}
            onPress={() =>
              handleModal(<PersonalEventDeleteModal personalEvent={props.eventData} handleNavigation={false} />)
            }
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView fez={props.eventData} />)}
      />
    </Menu>
  );
};
