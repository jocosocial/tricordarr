import React, {Dispatch, ReactNode, SetStateAction} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {PersonalEventDeleteModal} from '../../Views/Modals/PersonalEventDeleteModal.tsx';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

interface PersonalEventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: FezData;
  menuVisible: boolean;
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const PersonalEventCardActionsMenu = (props: PersonalEventCardActionsMenuProps) => {
  const {data: profilePublicData} = useUserProfileQuery();
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
            leadingIcon={AppIcons.edit}
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
        onPress={() => handleModal(<ReportModalView fez={props.eventData} />)}
      />
    </Menu>
  );
};
