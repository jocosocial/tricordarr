import React, {Dispatch, ReactNode, SetStateAction} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {PersonalEventDeleteModal} from '../../Views/Modals/PersonalEventDeleteModal.tsx';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {useUserData} from '../../Context/Contexts/UserDataContext.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

interface PersonalEventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: PersonalEventData;
  menuVisible: boolean;
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const PersonalEventCardActionsMenu = (props: PersonalEventCardActionsMenuProps) => {
  const {profilePublicData} = useUserData();
  const closeMenu = () => props.setMenuVisible(false);
  const {setModalContent, setModalVisible} = useModal();
  const navigation = useCommonStack();

  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <Menu visible={props.menuVisible} onDismiss={closeMenu} anchor={props.anchor}>
      {props.eventData.owner.userID === profilePublicData?.header.userID && (
        <>
          <Menu.Item
            leadingIcon={AppIcons.eventEdit}
            title={'Edit'}
            onPress={() => {
              closeMenu();
              navigation.push(CommonStackComponents.personalEventEditScreen, {
                personalEvent: props.eventData,
              });
            }}
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
        onPress={() => handleModal(<ReportModalView personalEvent={props.eventData} />)}
      />
    </Menu>
  );
};
