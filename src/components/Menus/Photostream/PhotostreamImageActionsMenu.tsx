import React, {ReactNode} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '#src/Enums/Icons';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {ModerateMenuItem} from '#src/Components/Menus/Items/ModerateMenuItem';
import {useCommonStack} from '#src/Navigation/CommonScreens';

interface PhotostreamImageActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  image: PhotostreamImageData;
}

export const PhotostreamImageActionsMenu = ({visible, closeMenu, anchor, image}: PhotostreamImageActionsMenuProps) => {
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator} = usePrivilege();
  const commonNavigation = useCommonStack();

  const handleReport = () => {
    closeMenu();
    setModalContent(<ReportModalView photostreamImage={image} />);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
      {hasModerator && (
        <>
          <Divider bold={true} />
          <ModerateMenuItem
            closeMenu={closeMenu}
            resourceID={image.postID.toString()}
            resource={'photostream'}
            navigation={commonNavigation}
          />
        </>
      )}
    </Menu>
  );
};
